/**
 * Generate a TSV string from a 2D array of values.
 * @param rows - The rows to generate the TSV from. Values will be converted to strings.
 * @returns a TSV string
 */
export function generateTsv(rows: unknown[][]) {
  return rows.map((row) => row.map(sanitizeTsvCell).join('\t')).join('\n')
}

function sanitizeTsvCell(cell: unknown) {
  return String(cell).replace(/\s+/g, ' ')
}
