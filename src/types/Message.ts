export interface Message {
    id: string;
    sender: {
        guid: string;
        name: string;
        userId: null;
    };
    body: string;
    timestamp: number;
}