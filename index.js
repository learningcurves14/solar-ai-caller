// ✅ MERGED index.js — combines Twilio webhook + Rachel's GPT stream server

require("dotenv").config();
const express = require("express");
const { twiml: { VoiceResponse } } = require("twilio");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// ✅ WebSocket streaming server for GPT audio
wss.on("connection", (ws) => {
  console.log("🔗 Twilio call connected to Rachel's stream");

  ws.on("message", (message) => {
    const parsed = JSON.parse(message);

    if (parsed.event === "start") {
      console.log("🟢 Stream started for call:", parsed.streamSid);
    }

    if (parsed.event === "media") {
      console.log("🎧 Received audio packet");
      // GPT pipeline logic will go here
    }

    if (parsed.event === "stop") {
      console.log("🔴 Stream stopped for call:", parsed.streamSid);
    }
  });

  ws.on("close", () => {
    console.log("❌ Call disconnected from Rachel's stream");
  });
});

// ✅ Twilio webhook route to stream audio to GPT
app.post("/voice", (req, res) => {
  const response = new VoiceResponse();

  response.connect().stream({
    url: process.env.WEBSOCKET_URL
  });

  res.type("text/xml").send(response.toString());
});

// ✅ Confirmation route
app.get("/", (req, res) => {
  res.send("✅ Rachel's AI call server is live and streaming on Railway!");
});

server.listen(PORT, () => {
  console.log(`🧠 Rachel's merged server is live on wss://solar-ai-ws-production.up.railway.app and port ${PORT}`);
});
