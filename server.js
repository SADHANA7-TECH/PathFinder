import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pathfinder-backend-2f596-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


app.get("/career-suggestion", async (req, res) => {
  try {
    const responsesRef = db.ref("responses");
    const snapshot = await responsesRef.once("value");
    if (!snapshot.exists()) return res.json({ message: "No responses found" });

    const allResponses = snapshot.val();
    const keys = Object.keys(allResponses);
    const latestKey = keys[keys.length - 1];
    const latestResponse = allResponses[latestKey].answers;

    const prompt = `
Student answered:
${JSON.stringify(latestResponse, null, 2)}

Generate a beginner-friendly career path recommendation and roadmap.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const suggestion = response.choices[0].message.content;

    res.json({ suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
