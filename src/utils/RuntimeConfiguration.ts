import { copyFileSync, existsSync, readFileSync } from 'fs'
import * as toml from 'toml'
import { z } from 'zod'

import { Environment } from '../config.js'

export const RuntimeConfigurationSchema = z.object({})

export type RuntimeConfigurationSchema = z.infer<
  typeof RuntimeConfigurationSchema
>

export class RuntimeConfiguration {
  private _data?: RuntimeConfigurationSchema

  async init() {
    return this._data ?? (await this.reload())
  }

  async reload() {
    this._data = RuntimeConfigurationSchema.parse(
      toml.parse(await this.fetch()),
    )
    return this._data
  }

  private async fetch(): Promise<string> {
    const url = Environment.BOT_CONFIG

    // Handle local file
    if (url.startsWith('file:')) {
      const path = url.slice(5)

      const exampleFile = 'bot-config.example.toml'
      if (!existsSync(path) && existsSync(exampleFile)) {
        copyFileSync(exampleFile, path)
        console.info(
          `[RuntimeConfiguration] Created initial configuration file: ${path}`,
        )
      }

      return readFileSync(path, 'utf-8')
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(
        `Unable to fetch runtime configuration: ${response.status} ${response.statusText}`,
      )
    }
    return response.text()
  }

  get data(): RuntimeConfigurationSchema {
    if (!this._data) {
      throw new Error('Runtime configuration not initialized')
    }

    return this._data
  }
}
