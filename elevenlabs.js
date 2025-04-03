require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
console.log("🧪 ElevenLabs API Key detected:", ELEVENLABS_API_KEY ? "✅ Found" : "❌ Not found");

const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel's Voice ID
const textToSpeak = "Hey there, this is your AI caller speaking. Let's book a solar appointment!";
const outputPath = "output.mp3";

async function generateSpeech() {
  console.log("🔊 Starting ElevenLabs voice generation...");

  try {
    const response = await axios({
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      data: {
        text: textToSpeak,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      },
      responseType: "stream",
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log("✅ Audio file created: output.mp3");
        resolve();
      });

      writer.on("error", (err) => {
        console.error("❌ Error writing audio file:", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("❌ ElevenLabs API call failed:", error.response?.data || error.message);
  }
}

generateSpeech();
