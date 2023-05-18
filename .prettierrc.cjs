// @ts-check

/** @satisfies {import('@trivago/prettier-plugin-sort-imports').PrettierConfig} */
const config = {
  bracketSpacing: true,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  semi: false,
  printWidth: 80,
  trailingComma: 'all',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    'dotenv/config',
    '^discord.js',
    '^@discordjs',
    '<THIRD_PARTY_MODULES>',
    '^[.][.]',
    '^[.]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}

module.exports = config
