/**
 * Format date to local ISO-like format using Asia/Bangkok timezone
 * @param d - anything parseable by Date constructor
 * @returns string formatted like "2023-05-14 17:00:00"
 */
export function toLocalDate(d: Date | string | number) {
  return new Date(new Date(d).getTime() + 3600e3 * 7)
    .toISOString()
    .split('T')
    .join(' ')
    .replace(/\.\d+Z/, '')
}
