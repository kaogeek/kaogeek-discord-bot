import axios from 'axios'
import cheerio from 'cheerio'

import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'
import { CommandInteraction } from '../../../node_modules/discord.js/typings/index.js'

//Fetch HTML Func
async function fetchHTML(url: string): Promise<string> {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching HTML:', error)
    throw error
  }
}

export default {
  data: {
    name: 'kaokai-today',
    description: 'News from Move Forward Party',
    options: [
      {
        name: 'latest', 
        description: 'Latest and up to date news from Move Forward Party',
        descriptionLocalizations: {
          th: 'ข่าวสารก้าวไกลทั้งหมดอัพเดตล่าสุด',
        },
        type: 1,
      },
      {
        name: 'highlight',
        description: 'Highlight news from Move Forward Party',
        descriptionLocalizations: {
          th: 'ไฮไลต์ข่าวสารก้าวไกล',
        },
        type: 1,
      },
    ],
  },
  execute: async (client, interaction: any) => {
    const option = await interaction.options.getSubcommand() // รับค่า sub-command ที่ถูกเรียกใช้
    if (option === 'latest') {
      const news_websiteURL = 'https://www.moveforwardparty.org/news/'
      const html = await fetchHTML(news_websiteURL)

      const $ = cheerio.load(html)

      const posts = $('[id^="post-"]')

      const postLinks = [] // เก็บลิงก์ของโพสต์

      let description = ''

      posts.each((index, element) => {
        const post: any = $(element)
        if (!post || post === undefined) return

        const titleElement = post.find('div.info > header > h2 > a')
        const title = titleElement.text()
        
        const dateElement = post.find('a > div > small')
        const date = dateElement.text()

        const postID = post.attr('id').replace('post-', '') // ดึง ID ของโพสต์

        const postLink = `https://www.moveforwardparty.org/news/${postID}` // สร้างลิงก์ของโพสต์
        postLinks.push(postLink) // เพิ่มลิงก์ในรายการ

        description += `[${title}](${postLink})\nDate: ${date}\n---------------------\n`
      })
      await interaction.editReply({
        embeds: [
          {
            description: `**Kao Kai Today (latest)**\n\n${description}`,
            color: 0xff7f00,
          },
        ],
      })
    } else if (option === 'highlight') {
      const news_websiteURL = 'https://www.moveforwardparty.org/'
      const html = await fetchHTML(news_websiteURL)

      const $ = cheerio.load(html)

      const posts = $('[id^="post-"]')

      const postLinks = []
      let description_highlight = ''

      let counter = 0 // Counter variable to track iterations

      posts.each((index, element) => {
        if (counter >= 7) {
          return false // Break the loop if the counter exceeds 7
        }

        const post: any = $(element)
        if (!post || post === undefined) return

        const titleElement = post.find('div.info > header > h2 > a')
        const title = titleElement.text()

        const postID = post.attr('id').replace('post-', '')
        const postLink = `https://www.moveforwardparty.org/news/${postID}`
        postLinks.push(postLink)

        description_highlight += `[${title}](${postLink})\n---------------------\n`

        counter++ // Increment the counter after each iteration
      })
      await interaction.editReply({
        embeds: [
          {
            description: `**Kao Kai Today (highlight)**\n\n${description_highlight}`,
            color: 0xff7f00,
          },
        ],
      })
    } else {
      // กรณีไม่ระบุตัวเลือกใดๆ
      await interaction.editReply({
        content: 'Please select a valid option.',
      })
    }
  },
} satisfies CommandHandlerConfig
