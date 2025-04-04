// index.js
require("dotenv").config();
const express = require("express");
const { twiml: { VoiceResponse } } = require("twilio");
const axios = require("axios");
const WebSocket = require("ws");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// ✅ Serve Twilio webhook
app.post("/voice", (req, res) => {
  const response = new VoiceResponse();

  // Start Twilio <Stream> to send audio to GPT agent
  const gather = response.gather({
    input: "speech",
    action: "/hangup",
    method: "POST"
  });

  gather.say(
    {
      voice: "woman",
      language: "en-US",
    },
    "Hi there! This is Rachel. Thanks for calling. What can I help you with today?"
  );

  response.connect().stream({ url: process.env.WEBSOCKET_URL });

  res.type("text/xml").send(response.toString());
});

// ✅ Basic /hangup route
app.post("/hangup", (req, res) => {
  const response = new VoiceResponse();
  response.say("Thanks for calling! Goodbye.");
  response.hangup();
  res.type("text/xml").send(response.toString());
});

// ✅ Confirm server running
app.get("/", (req, res) => {
  res.send("✅ AI call server is running and streaming to Rachel!");
});

app.listen(PORT, () => {
  console.log(`\u2705 Server running on http://localhost:${PORT}`);
});
