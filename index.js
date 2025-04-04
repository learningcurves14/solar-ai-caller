const express = require("express");
const { twiml } = require("twilio");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));

// ✅ Handle incoming calls
app.post("/voice", (req, res) => {
  const response = new twiml.VoiceResponse();

  const stream = response.connect();
  stream.stream({
    url: "wss://solar-ai-ws.up.railway.app",
  });

  response.say(
    {
      voice: "woman",
      language: "en-US",
    },
    "Hi there! This is Rachel. Thanks for calling. What can I help you with today?"
  );

  res.type("text/xml");
  res.send(response.toString());
});

// ✅ Confirm server is live
app.get("/", (req, res) => {
  res.send("✅ AI call server is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
