require("dotenv").config();
const express = require("express");
const { twiml: { VoiceResponse } } = require("twilio");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// ✅ Twilio webhook route for incoming calls
app.post("/voice", (req, res) => {
  const response = new VoiceResponse();

  // Start Twilio <Stream> for real-time audio
  response.connect().stream({
    url: process.env.WEBSOCKET_URL,
  });

  res.type("text/xml").send(response.toString());
});

// ✅ Basic /hangup route
app.post("/hangup", (req, res) => {
  const response = new VoiceResponse();
  response.say("Thanks for calling! Goodbye.");
  response.hangup();
  res.type("text/xml").send(response.toString());
});

// ✅ Root status check
app.get("/", (req, res) => {
  res.send("✅ Rachel's AI call server is live and ready to stream!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});