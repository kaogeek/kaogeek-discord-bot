import { CommandInteraction } from 'discord.js'

import cheerio from 'cheerio'

import { CommandHandlerConfig } from '../../types/CommandHandlerConfig.js'

// Fetch HTML Func
async function fetchHTML(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    return await response.text()
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
            title: 'Kao Kai Today (latest)',
            description: `${description}`,
            thumbnail: {
              url: 'https://www.moveforwardparty.org/wp-content/uploads/2021/03/400px-Move_Forward_Party_Logo.svg.png',
            },
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

      const postsToDisplay = posts.slice(0, 7) // Get only the first 7 posts

      postsToDisplay.each((index, element) => {
        const post: any = $(element)
        if (!post || post === undefined) return

        const titleElement = post.find('div.info > header > h2 > a')
        const title = titleElement.text()

        const postID = post.attr('id').replace('post-', '')
        const postLink = `https://www.moveforwardparty.org/news/${postID}`
        postLinks.push(postLink)

        description_highlight += `[${title}](${postLink})\n---------------------\n`
      })
      await interaction.editReply({
        embeds: [
          {
            title: 'Kao Kai Today (highlight)',
            description: `${description_highlight}`,
            thumbnail: {
              url: 'https://www.moveforwardparty.org/wp-content/uploads/2021/03/400px-Move_Forward_Party_Logo.svg.png',
            },
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
