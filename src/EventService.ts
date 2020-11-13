// --------------------------------------------------------------
//       The BlueJeans Event Handler Object
// --------------------------------------------------------------
import { MessageHandler, LoggerFunction, SocketConfig } from './types';
import sockjs from 'sockjs-client';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function invokeIfImplemented(handlers: MessageHandler<any>[], methodName: string, arg: unknown): unknown {
    return handlers.find(h => h[methodName] !== undefined)?.[methodName]?.(methodName, arg);
}

export class EventService {
    connected = false;
    joinTimeout: NodeJS.Timeout|undefined;
    sock: WebSocket|undefined = undefined;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    readonly handlers: { [key: string]: MessageHandler<any> } = {};
    readonly reqCallbacks: { [key: string]: ((a: unknown, b: unknown) => unknown)|undefined } = {};
    reqId: number|undefined = undefined;
    cbStatus: LoggerFunction|undefined = undefined;
    cbError: LoggerFunction|undefined = undefined;

    meetingAccessToken: string|undefined = undefined;
    config: SocketConfig|undefined = undefined;

    maxReconnects = 10;
    reconnects = 0;
    reconnectBackoff = 1000;
    isReconnecting = false;
    isCrashed = false;

    events(): { [key: string]: ((data: unknown) => unknown)|undefined } {
        return {
            guid_assigned: (this.guidAssigned as (data: unknown) => unknown),
            remoteclose: (this.remoteclose as (data: unknown) => unknown),
            pairingError: (this.pairingError as (data: unknown) => unknown),
            kicked: (this.kicked as (data: unknown) => unknown),
            error: (this.registerError as (data: unknown) => unknown),
        };
    }

    errMsg(errstr: string): void {
        this.cbError?.(errstr);
    }
		
    statusMsg(smsg: string): void {
        this.cbStatus?.(smsg);
    }

    setStatusCallbacks(cbStatus: LoggerFunction, cbError: LoggerFunction): void {
        this.cbStatus = cbStatus;
        this.cbError = cbError;
    }

    clearStatusCallbacks(): void {
        this.cbStatus = undefined;
        this.cbError = undefined;
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    registerHandler(handler: MessageHandler<any>, namespace: string): void {
        this.handlers[namespace] = handler;
    }
    
    setUpSocket(opts: SocketConfig): void {
        if (this.sock !== undefined) {
            if (this.joinTimeout !== undefined) {
                clearTimeout(this.joinTimeout);
                this.joinTimeout = undefined;
            }
            this.sock.onclose = null;
        }

        this.close();
        const transports = [
            'websocket', 'xdr-streaming', 'xhr-streaming',
            'xdr-polling', 'xhr-polling', 'iframe-xhr-polling',
            'jsonp-polling',
        ];
        this.meetingAccessToken = opts.access_token;
        this.config = opts;
        this.sock = new sockjs(opts.eventServiceUrl, {}, { transports })

        if (this.joinTimeout !== undefined) {
            clearTimeout(this.joinTimeout);
            this.joinTimeout = undefined;
        }
        
        this.sock.onopen = () => {
            if (this.isCrashed) {
                this.forceClose();
                return;
            }
            const registration = {
                ...opts,
                events: ['meeting', 'chat', 'private_chat', 'notification'],
            };
            this.sendEvent('meeting.register', registration);
            invokeIfImplemented(Object.values(this.handlers), 'onOpen', opts.access_token);
            this.reconnects = 0;
            this.joinTimeout = setTimeout(() => {
                if (!this.connected) {
                    this.sock?.close();
                }
                this.joinTimeout = undefined;
            }, 10000);
        };

        this.sock.onmessage = e => {
            const msg = JSON.parse(e.data) as Array<unknown>;
            if ((msg.length === 2) && typeof msg[1] === 'object') {
                const event = msg[0] as string;
                const data = msg[1] as { [key: string ]: string };
                if (event === 'keepalive') {
                    this.sendEvent('heartbeat');
                } else {
                    if (data && data.reqId && this.reqCallbacks[data.reqId]) {
                        this.reqCallbacks[data.reqId]?.(data.error, data.data);
                        this.reqCallbacks[data.reqId] = undefined;
                    }

                    const protocol = /([^.]*)$/.exec(event)?.[0];
                    if (protocol !== undefined && this.events()[protocol] !== undefined) {
                        this.events()[protocol]?.call(this, data);
                    } else {
                        const namespaces = Object.keys(this.handlers);
                        const hKey = namespaces.find(n => n.match('^' + n)?.length !== 0);
                        if (hKey !== undefined) {
                            this.handlers[hKey]?.onMessage(event, data);
                        }
                    }
                }
            }
        };

        this.sock.onclose = () => {
            this.connected = false;

            if (this.joinTimeout !== undefined)
            {
                clearTimeout(this.joinTimeout);
                this.joinTimeout = undefined;
            }
            if (this.isCrashed) {
                invokeIfImplemented(Object.values(this.handlers), 'onClosedUnexpectedly', {});
                this.reconnect()
            } else {
                invokeIfImplemented(Object.values(this.handlers), 'onClose', {});
            }
        };

        this.sock.onerror = () => {
            invokeIfImplemented(Object.values(this.handlers), 'onError', {});
        };
    }

    guidAssigned(event: { seamGuid: string, guid: string }): void {
        this.statusMsg(`(Evt Svc: connected) Endpt guid: ${event.seamGuid}`);
        this.connected = true;
        invokeIfImplemented(Object.values(this.handlers), "onConnect", {participantGuid: event.seamGuid, chatGuid: event.guid});
    }

    close(): void {
        this.connected = false;
        if (this.sock !== undefined) {
            this.sock.close();
        }
    }

    reconnect(): void {
        this.connected = false;
        if (this.reconnects < this.maxReconnects && this.meetingAccessToken !== undefined && !this.isReconnecting && this.config !== undefined) {
            this.isReconnecting = true;
            setTimeout(() => {
                if (this.config === undefined) {
                    return;
                }
                this.setUpSocket(this.config);
                this.isReconnecting = false;
                this.reconnects++;
            }, this.reconnectBackoff * (this.reconnects > 10 ? 10 : this.reconnects));
        }
    }

    remoteclose(): void {
        this.errMsg('remote close');
        invokeIfImplemented(Object.values(this.handlers), 'remoteclose', undefined);
    }

    pairingError(err: unknown): void {
        this.errMsg(`Error Pairing Meeting: ${JSON.stringify(err)}`);
        setTimeout(() => this.sock?.close(), 200);
    }

    isDisconnected(): boolean {
        return !this.isConnected();
    }

    isConnected(): boolean {
        return this.sock !== undefined && this.connected;
    }

    isJoinEvent(event: string): boolean {
        return event === 'meeting.register';
    }

    sendEvent(event: string, data?: unknown): void {
        if (event === 'heartbeat' || this.isJoinEvent(event) || this.isConnected()) {
            this.sock?.send(JSON.stringify([event, data ?? {}]));
        } else {
            this.errMsg('Cannot send event because sock or GUID not yet ready');
        }
    }

    sendRequest(event: string, data: unknown, callback: (data: unknown) => unknown): void {
        if (this.isConnected()) {
            this.reqId ??= 0;
            this.reqId++;
            this.reqCallbacks[this.reqId] = callback;
            this.sock?.send(JSON.stringify([event, {
                reqId: this.reqId,
                data: data ?? {}
            }]));
        } else {
            callback({
                error: {
                    message: 'Sending Request while not connected',
                },
            });
        }
    }

    kicked(): void {
        this.errMsg('Kicked');
        this.forceClose();
    }

    crashed(): void {
        this.errMsg('Crashed');
        this.isCrashed = true;
        this.forceClose();
    }

    registerError(): void {
        this.errMsg('Authentication Failure');
        this.forceClose();
    }

    forceClose(): void {
        if (this.sock !== undefined) {
            this.sock.onclose = null;
            this.sock.close();
        }
    }
}
