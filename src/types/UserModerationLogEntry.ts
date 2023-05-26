//standardize the moderation log type by using enum instead of custom string.
export enum UserModerationLogEntryType {
  Strike = 'strike',
  Mute = 'mute',
}
