// gpt-stream.js — Rachel’s AI brain
require("dotenv").config();
const { OpenAI } = require("openai");
const { Readable } = require("stream");
const fs = require("fs");
const axios = require("axios");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioBuffer) {
  const response = await openai.audio.transcriptions.create({
    file: await openai.files.create({
      name: "audio.wav",
      buffer: audioBuffer,
      purpose: "transcription",
    }),
    model: "whisper-1",
  });
  return response.text;
}

async function getGPTReply(userInput) {
  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are Rachel, a friendly but professional solar AI assistant for Ohio Solar Initiative. Start conversations naturally. Always book an appointment or offer help. Never sound robotic.`,
      },
      {
        role: "user",
        content: userInput,
      },
    ],
  });
  return chat.choices[0].message.content;
}

async function synthesizeSpeech(text) {
  const response = await axios({
    method: "POST",
    url: `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    data: {
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
      },
    },
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
}

module.exports = {
  transcribeAudio,
  getGPTReply,
  synthesizeSpeech,
};
