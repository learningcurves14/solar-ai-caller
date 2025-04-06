// voice-stream.js (Debugging Enhanced)
require("dotenv").config();
const WebSocket = require("ws");
const axios = require("axios");
const fs = require("fs");
const { OpenAI } = require("openai");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const wss = new WebSocket.Server({ port: PORT });

console.log(`🧠 Rachel's merged server is live on wss://solar-ai-ws-production.up.railway.app and port ${PORT}`);

wss.on("connection", (ws) => {
  console.log("🔗 Twilio call connected to Rachel's stream");
  let audioBuffer = [];

  ws.on("message", async (message) => {
    const parsed = JSON.parse(message);

    if (parsed.event === "start") {
      console.log("🟢 Stream started for call:", parsed.streamSid);
    }

    if (parsed.event === "media") {
      const chunk = Buffer.from(parsed.media.payload, "base64");
      audioBuffer.push(chunk);
    }

    if (parsed.event === "stop") {
      console.log("🔴 Stream stopped for call:", parsed.streamSid);
      const fullAudio = Buffer.concat(audioBuffer);
      const inputPath = "input.wav";

      try {
        fs.writeFileSync(inputPath, fullAudio);
        console.log("🎙️ Saved audio to input.wav");

        const whisperResponse = await openai.audio.transcriptions.create({
          file: fs.createReadStream(inputPath),
          model: "whisper-1"
        });

        const transcript = whisperResponse.text;
        console.log("📝 Transcription:", transcript);

        const chat = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You're Rachel, a friendly AI helping homeowners explore solar options." },
            { role: "user", content: transcript }
          ]
        });

        const reply = chat.choices[0].message.content;
        console.log("💬 GPT Response:", reply);

        const voiceResponse = await axios({
          method: "POST",
          url: "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
          },
          data: {
            text: reply,
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.4, similarity_boost: 0.8 }
          },
          responseType: "stream"
        });

        const outputPath = "output.mp3";
        const writer = fs.createWriteStream(outputPath);
        voiceResponse.data.pipe(writer);

        writer.on("finish", () => {
          console.log("✅ AI reply generated in output.mp3");
        });

        writer.on("error", (err) => {
          console.error("❌ Error writing output.mp3:", err);
        });
      } catch (error) {
        console.error("❌ Pipeline failed:", error.response?.data || error.message);
      }
    }
  });

  ws.on("close", () => {
    console.log("❌ Call disconnected from Rachel's stream");
  });
});
