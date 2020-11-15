interface OauthInfo {
    access_token: string;
    expires_in: number;
    scope: {
        meeting: {
            id: number;
            leaderId: number;
            meetingNumericId: string;
            meetingUri: string;
            isModerator: boolean;
            endpointUriSet: unknown[];
            meetingId: string;
        };
    };
}

interface BlueJeansPhone {
    number: string;
    country: string;
    default: boolean;
    premium: boolean;
    custom: boolean;
    sortOrder: number;
    id: number;
    countryName: string;
    label: {
        default: string;
    };
    defaultSettingsInherited: boolean;
    tollfree: boolean;
}

interface LeaderInfo {
    profilePictureURL: string;
    enterpriseGroups: string[];
    enabledFeatures: string[];
    freeTrial: boolean;
    isVerified: boolean;
    freeTrialOptIn: boolean;
    timezone: string;
    enterprise: {
        overrideUSerEndpoing: boolean;
        name: string;
        defaultEndpoint: string;
        id: number;
    };
    recordingProEnabled: boolean;
    defaultEndpoint: string;
    groups: string[];
    language: string;
    firstName: string;
    lastName: string;
    timeFormat: number;
    attributes: unknown[];
    id: number;
    userRoom: {
        showVideoAnimations: boolean;
        defaultLayout: string;
        playAudioAlerts: boolean;
    };
    passwordChangeReason: string;
    channel_id: number;
    username: string;
}

interface ReccurrencePattern {
    monthOfYear: string;
    endDate: number;
    dayOfMonth: number;
    weekOfMonth: string;
    daysOfWeekMask: number;
    recurrenceCount: number;
    recurrenceType: string;
    frequency: number;
}

interface AdvancedEditability {
    allowParticipantsHijackScreenShare: boolean;
    autoRecord: boolean;
    enforceMeetingEncryption: boolean;
    addParticipantPasscode: boolean;
    allowModeratorScreenShare: boolean;
    allowHighlights: boolean;
    disallowChat: boolean;
    moderatorLess: boolean;
    allowClosedCaptioning: boolean;
    videoBestFit: boolean;
    enforceMeetingEncryptionAllowPSTN: boolean;
    allowParticipantsStartScreenShare: boolean;
    allowLiveTranscription: boolean;
    muteParticipantsOnEntry: boolean;
    showAllAttendeesInMeetingInvite: boolean;
}

interface AdvancedMeetingOptions {
    allowParticipantsHijackScreenShare: boolean;
    autoRecord: boolean;
    allowModeratorScreenShare: boolean;
    allowHighlights: boolean;
    disallowChat: boolean;
    encryptionType: string;
    moderatorLess: boolean;
    allowStream: boolean;
    allowClosedCaptioning: boolean;
    publishMeeting: boolean;
    videoBestFit: boolean;
    editability: AdvancedEditability;
    videoMuteParticipantsOnEntry: boolean;
    allowParticipantsStartScreenShare: boolean;
    muteParticipantsOnEntry: boolean;
    allowLiveTranscription: boolean;
    showAllAttendeesInMeetingInvite: boolean;
    meetingAccessType: string;
}

interface ScheduledMeeting {
    isLargeMeeting: boolean;
    recurrencePattern: ReccurrencePattern;
    timezone: string;
    start: number;
    description: string;
    title: string;
    endPointType: string;
    addAttendeePasscode: boolean;
    deleted: boolean;
    endPointVersion: string;
    advancedMeetingOptions: AdvancedMeetingOptions;
    attendeePasscode: string;
    end: number;
    allow720p: boolean;
    id: number;
    locked: boolean;
    isExpired: boolean;
}

interface EnabledEndpoint {
    [index: string]: {
        [index: string]: string;
    };
}

interface LiveMeetingInfo {
    allowParticipantsHijackScreenShare: boolean;
    isContentSharingActive: boolean;
    isLargeMeeting: boolean;
    recordingEnabled: boolean;
    allowModeratorScreenShare: boolean;
    showBanners: boolean;
    meetingMarkedForDelayedTermination: boolean;
    audioMuteOnEntry: boolean;
    moderatorLess: boolean;
    title: string;
    chatEnabled: boolean;
    participantWebJoinURL: string;
    audioEndpointCount: number;
    videoMuteOnEntry: boolean;
    videoEndpointCount: number;
    allowParticipantsStartScreenShare: boolean;
    bridged: boolean;
    inactiveMeetingStatus: boolean;
    meetingState: string;
    locked: boolean;
    playAudioAlerts: boolean;
    status: string;
}

export interface AggregatePayload {
    oauthInfo: OauthInfo;
    meetingInfo: {
        pluginConfigurations: unknown[];
        assetServiceURL: string;
        eventServiceURL: string;
        allBJNumbers: BlueJeansPhone[];
        leaderInfo: LeaderInfo;
        scheduledMeetingInfo: ScheduledMeeting;
        enabledEndpoints: EnabledEndpoint;
        meetingNumbers: {
            allowDirectDial: boolean;
            partnerIntegratedMeeting: boolean;
            pstnNumbersUrl: string;
            precision: string;
            numbers: BlueJeansPhone[];
            meetingId: string;
            pstnLocalizationSupported: boolean;
            useAttendeePasscode: boolean;
        };
        liveMeetingInfo: LiveMeetingInfo;
        forceModeratorLogin: boolean;
        isPersonalMeeting: boolean;
    };
    platformInfo: {
        platformType: string;
    };
}