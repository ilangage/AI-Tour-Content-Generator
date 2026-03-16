import OpenAI from 'openai'

const apiKey =
  process.env.openai_api_key ?? process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error(
    'Missing OpenAI API key. Set openai_api_key or OPENAI_API_KEY in .env.local'
  )
}

export const openai = new OpenAI({ apiKey })
