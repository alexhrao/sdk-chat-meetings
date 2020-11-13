import {
    AggregatePayload,
    LoggerFunction,
    MessageHandler,
    Message,
    ConnectionOptions,
} from './types';
import { post } from './auth';
import { EventService } from './EventService';

const errMsg: LoggerFunction = (msg: string) => {
	console.log(`Error: ${msg}`);
}

const statusMsg: LoggerFunction = (msg: string) => {
	console.log(`Status: ${msg}`);
}

export class ChatSDK {
    readonly myMeetingEvents: EventService = new EventService();

    disconnect(): void {
        this.myMeetingEvents.close();
    }

    onReceiveMessage(handler: MessageHandler<Message>): void {
        this.myMeetingEvents.registerHandler(handler, 'meeting.chat');
        this.myMeetingEvents.registerHandler(handler, 'meeting.private')
    }

    onNotification(handler: MessageHandler<Notification>): void {
        this.myMeetingEvents.registerHandler(handler, 'meeting.notification');
    }

    async connectToMeeting(opts: ConnectionOptions): Promise<AggregatePayload> {
        opts.name ??= 'Chatbot';

        const aggregator = {
            grant_type: 'meeting_passcode',
            meetingNumericId: opts.meetingId,
            meetingPasscode: opts.meetingPasscode,
        };

        const api = 'api.bluejeans.com';
        const endpoint = '/v1/services/aggregator/meeting';
        return post<AggregatePayload>(api, endpoint, aggregator)
            .then(res => {
                if (this.myMeetingEvents) {
                    const config = {
                        numeric_id: opts.meetingId,
                        access_token: res.oauthInfo.access_token,
                        user: {
                            full_name: opts.name ?? 'Chatbot',
                            is_leader: false,
                        },
                        leader_id: res.oauthInfo.scope.meeting.leaderId,
                        protocol: '2',
                        endpointType: 'sdk',
                        eventServiceUrl: res.meetingInfo.eventServiceURL,
                    };
                    this.myMeetingEvents.setUpSocket(config);
                    this.myMeetingEvents.setStatusCallbacks(statusMsg, errMsg);
                }
                return res;
            })
            .catch(err => {
                errMsg(`Error! here: ${err}`);
                process.exit(1);
            });
    }

    sendMessage(msg: string): void {
        this.myMeetingEvents.sendEvent("meeting.chat.msg", { msg });
    }

    sendPrivateMessage(msg: string, guid: string): void {
        this.myMeetingEvents.sendEvent("meeting.private.msg", {
            msg,
            receiver: { guid },
        });
    }
}
