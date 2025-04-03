const express = require("express");
const { twiml } = require("twilio");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));

// ✅ Basic voice route
app.post("/voice", (req, res) => {
  const twimlResponse = new twiml.VoiceResponse();

  twimlResponse.say(
    {
      voice: "woman",
      language: "en-US",
    },
    "Hey there! This is your solar A I assistant. We'll be speaking with you shortly!"
  );

  res.type("text/xml");
  res.send(twimlResponse.toString());
});

// ✅ Confirm server
app.get("/", (req, res) => {
  res.send("✅ AI call server is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
