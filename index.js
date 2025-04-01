require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Basic test route
app.get("/", (req, res) => {
  res.send("✅ AI call server is running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test route for GPT-4
app.get("/ask-ai", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful AI appointment setter for a solar company." },
        { role: "user", content: "Hey, I’m not sure I’m interested in solar right now." },
      ],
    });

    const reply = response.choices[0].message.content;
    console.log("🤖 AI says:", reply);
    res.send(reply);
  } catch (error) {
    console.error("❌ Error calling OpenAI:", error.message);
    res.status(500).send("Something went wrong.");
  }
});
// Handle incoming voice calls from Twilio
app.post("/voice", (req, res) => {
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.say("Hi there! I'm your AI assistant from Ohio Solar Initiative. This call is recorded. Let's see if your home still qualifies for new solar programs.");
    res.type("text/xml");
    res.send(twiml.toString());
  });
  