export interface SocketConfig {
    numeric_id: string;
    access_token: string;
    user: {
        full_name: string;
        is_leader: boolean;
    };
    leader_id: number;
    protocol: string;
    endpointType: string;
    eventServiceUrl: string;
}