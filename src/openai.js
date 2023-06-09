import { Configuration, OpenAIApi } from "openai"
import { createReadStream } from "fs"

const openaiKey = import.meta.env.OPENAI_KEY

class OpenAI {
  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system"
  }
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey
    })
    this.openai = new OpenAIApi(configuration)
  }

  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages
      })

      return response.data.choices[0].messages
    } catch (error) {
      console.log(`Error while gpt chat`, error.message)
    }
  }

  async transcription(filepath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filepath),
        "whisper-1"
      )
      return response.data.text
    } catch (error) {
      console.log("Error while transcription", error.message)
    }
  }
}

export const openai = new OpenAI(openaiKey)
