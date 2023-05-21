//standardize the moderation log type by using enum instead of custom string. 

export enum UserModerationLogEntryType {
    Strike = 'Strike',
    Mute = 'Mute',
}