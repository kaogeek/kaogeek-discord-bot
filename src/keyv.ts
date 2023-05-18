import fs from 'fs'
import Keyv from 'keyv'

// Check Folder: ./.data/db.sqlite
if (!fs.existsSync('./.data')) fs.mkdirSync('./.data')
export const keyv = new Keyv('sqlite://./.data/db.sqlite')
