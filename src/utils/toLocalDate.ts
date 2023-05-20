export function toLocalDate(d: Date | string | number) {
  return new Date(new Date(d).getTime() + 3600e3 * 7)
    .toISOString()
    .split('T')
    .join(' ')
    .replace(/\.\d+Z/, '')
}
