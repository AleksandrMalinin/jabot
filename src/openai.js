import { Configuration, OpenAIApi } from "openai"
import { createReadStream } from "fs"

const openaiKey = import.meta.env.OPENAI_KEY

class OpenAI {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey
    })
    this.openai = new OpenAIApi(configuration)
  }

  chat() {}

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
