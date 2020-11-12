export interface Notification {
    id: string;
    sender: {
        guid: string;
        name: string;
        userId: null;
    };
    body: string;
    timestamp: number;
}
