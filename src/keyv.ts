import Keyv from 'keyv'
import fs from 'fs'
// Check Folder: ./.data/db.sqlite
if (!fs.existsSync('./.data')) fs.mkdirSync('./.data')
export const keyv = new Keyv('sqlite://./.data/db.sqlite')