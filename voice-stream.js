require("dotenv").config();
const WebSocket = require("ws");
const axios = require("axios");
const { OpenAI } = require("openai");
const { Readable } = require("stream");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const wss = new WebSocket.Server({ port: 5005 });

console.log("🧠 Rachel’s brain is online and listening on ws://localhost:5005");

wss.on("connection", (ws) => {
  console.log("🔗 Twilio call connected");

  let audioBuffer = Buffer.from([]);

  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    if (data.event === "start") {
      console.log("🟢 Stream started");
    }

    if (data.event === "media") {
      const audio = Buffer.from(data.media.payload, "base64");
      audioBuffer = Buffer.concat([audioBuffer, audio]);
    }

    if (data.event === "stop") {
      console.log("🔴 Stream stopped — transcribing...");

      try {
        // 🔊 Convert Buffer to readable stream for Whisper
        const stream = Readable.from(audioBuffer);
        const transcription = await openai.audio.transcriptions.create({
          file: stream,
          model: "whisper-1",
        });

        const userText = transcription.text;
        console.log("💬 User said:", userText);

        // 🧠 GPT-4 response
        const chatResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are Rachel, a friendly AI voice assistant who speaks clearly and helpfully.",
            },
            {
              role: "user",
              content: userText,
            },
          ],
        });

        const rachelReply = chatResponse.choices[0].message.content;
        console.log("🧠 Rachel says:", rachelReply);

        // 🗣️ Send to ElevenLabs for voice generation
        const audioStream = await axios({
          method: "POST",
          url: "https://api.elevenlabs.io/v1/text-to-speech/" + process.env.ELEVENLABS_VOICE_ID,
          headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          data: {
            text: rachelReply,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          },
          responseType: "arraybuffer",
        });

        const responseAudio = Buffer.from(audioStream.data);
        ws.send(
          JSON.stringify({
            event: "media",
            media: {
              payload: responseAudio.toString("base64"),
            },
          })
        );

        console.log("📤 Reply sent back to Twilio");

        // 🛑 Close stream
        ws.send(JSON.stringify({ event: "stop" }));
        ws.close();
      } catch (err) {
        console.error("❌ Error in pipeline:", err.message);
        ws.close();
      }
    }
  });

  ws.on("close", () => {
    console.log("❌ Disconnected from Twilio");
  });
});
