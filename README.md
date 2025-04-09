# shane-speech-to-text

<p>Ensure node is installed.<br>
Project bootstrapped with vite as create-react-app has been deprecated.<br>
To run locally, use npm run dev<br>
To run tests, npx playwright install will need to be run after npm install<br>
Tests are run with vitest (jest is not fully compatible with Vite), and are run headlessly with playwright in a chromium browser
</p>

<p>Google Speech-To-Text API is used for offline transcriptions, an API key can be provided.
Free 90-day trial is currently being used.<br>
The app makes a request to a backend express server to handle sending the audio blob to Google
</p>

Some possible extensions to make app more user-friendly:

1) Detect connection issues during recording, not just at start
2) Save recordings and transcripts to storage (most likely IndexedDB) to allow for multiple recordings/downloads
3) Save a segment of a transcript each time recording is paused, this would allow for only the segment that had
   connection issued to be sent for transcription remotely