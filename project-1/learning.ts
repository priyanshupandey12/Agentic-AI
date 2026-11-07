import 'dotenv/config'
import {GoogleGenAI} from "@google/genai"


const ai= new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY})

const interaction = await ai.interactions.create({
    model:"gemini-3.5-flash",
    input:"Hello, can you explain the ME?"
})

console.log(interaction)