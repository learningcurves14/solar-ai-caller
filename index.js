const WebSocket = require("ws");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("🟢 New WebSocket connection");

  ws.on("message", (message) => {
    console.log("📨 Received:", message.toString());

    // Echo back for now (you'll replace this with GPT later)
    ws.send(`You said: ${message}`);
  });

  ws.on("close", () => {
    console.log("🔴 WebSocket connection closed");
  });
});

app.get("/", (req, res) => {
  res.send("✅ WebSocket server is live!");
});

server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
