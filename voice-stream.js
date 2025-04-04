const WebSocket = require("ws");

// ✅ Bind to port 5005 for Railway public access
const wss = new WebSocket.Server({ port: 5005 });

console.log("🧠 Rachel's voice stream server listening on wss://solar-ai-ws-production.up.railway.app");

// Handle incoming WebSocket connections
wss.on("connection", (ws) => {
  console.log("🔗 Twilio call connected to Rachel's stream");

  ws.on("message", (message) => {
    try {
      const parsed = JSON.parse(message);

      if (parsed.event === "start") {
        console.log("🟢 Stream started for call:", parsed.streamSid);
      }

      if (parsed.event === "media") {
        console.log("🎧 Received audio packet");
        // We'll process audio here soon (send to STT → GPT → ElevenLabs)
      }

      if (parsed.event === "stop") {
        console.log("🔴 Stream stopped for call:", parsed.streamSid);
      }
    } catch (err) {
      console.error("❌ Failed to parse message:", err);
    }
  });

  ws.on("close", () => {
    console.log("❌ Call disconnected");
  });
});
