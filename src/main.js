import { Telegraf, session } from "telegraf"
import { message } from "telegraf/filters"
import { code } from "telegraf/format"
import { ogg } from "./ogg.js"
import { openai } from "./openai.js"

const tgToken = import.meta.env.TG_TOKEN

const INITIAL_SESSION = {
  messages: []
}

const bot = new Telegraf(tgToken)

bot.use(session())

bot.command("new", async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply("Жду вашего голосового или текстового сообщения")
})

bot.command("start", async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply("Жду вашего голосового или текстового сообщения")
})

bot.on(message("voice"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION

  try {
    await ctx.reply(code("Сообщение обрабатывается..."))
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)
    const oggPath = await ogg.create(link.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)

    const text = await openai.transcription(mp3Path)
    await ctx.reply(code(`Текст сообщения: ${text}`))

    ctx.session.messages.push({ role: openai.roles.USER, context: text })

    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      context: response.content
    })

    await ctx.reply(response.content)
  } catch (error) {
    console.log(`Error while voice message`, error.message)
  }
})

bot.on(message("text"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION

  try {
    await ctx.reply(code("Сообщение обрабатывается..."))
    ctx.session.messages.push({
      role: openai.roles.USER,
      context: ctx.message.text
    })

    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      context: response.content
    })

    await ctx.reply(response.content)
  } catch (error) {
    console.log(`Error while voice message`, error.message)
  }
})

bot.command("start", async (ctx) => {
  await ctx.reply(JSON.stringify(ctx.message, null, 2))
})

bot.launch()

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))
