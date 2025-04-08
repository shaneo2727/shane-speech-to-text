import dotenv from "dotenv";
import express from "express";
import speech from "@google-cloud/speech";

dotenv.config();

const app = express();
const port = process.env.VITE_API_PORT;

app.post("/api/v1/google_text_to_speech", (req, res) => {
  req.on("readable", async function () {
    const data = req.read();
    if (data) {
      const client = new speech.SpeechClient({
        apiKey: process.env.GOOGLE_API_KEY,
      });
      const audio = {
        content: data,
      };
      const config = {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: "en-US",
      };
      const request = {
        audio: audio,
        config: config,
      };
      const [response] = await client.recognize(request);
      res.send({
        results: response.results[0].alternatives[0].transcript,
      });
    }
  });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
