import dotenv from "dotenv";
import express from "express";
import speech from "@google-cloud/speech";
import { StatusCodes } from "http-status-codes";

dotenv.config();

const app = express();
const port = process.env.VITE_API_PORT;
const client = new speech.SpeechClient({
  apiKey: process.env.GOOGLE_API_KEY,
});

app.post("/api/v1/google_text_to_speech", (req, res) => {
  req.on("readable", async function () {
    const data = req.read();
    try {
      if (data) {
        console.log(data);
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
        console.log(request);
        const [response] = await client.recognize(request);
        console.log(response);
        if (response.results && response.results.length > 0) {
          if (
            response.results[0].alternatives &&
            response.results[0].alternatives.length > 0
          )
            res.send({
              results: response.results[0].alternatives[0].transcript,
            });
          else {
            throw new Error();
          }
        } else {
          throw new Error();
        }
      }
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send("Google Speech-To-Text service failed");
    }
  });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
