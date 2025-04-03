const WebSocket = require("ws");

// Create a simple WebSocket server
const wss = new WebSocket.Server({ port: 5005 });

console.log("🧠 Rachel's voice stream server listening on ws://localhost:5005");

wss.on("connection", (ws) => {
  console.log("🔗 Twilio call connected to Rachel's stream");

  ws.on("message", (message) => {
    // Parse the raw message data
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
  });

  ws.on("close", () => {
    console.log("❌ Call disconnected");
  });
});
