import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());


// ==================================================
// SERVE MASAR WEBSITE
// ==================================================

app.use(express.static(path.join(__dirname, "jordan-tourism")));


// ==================================================
// MASAR AI ENDPOINT
// ==================================================

app.post("/api/masar-chat", async (req, res) => {

    try {

        const { messages, location } = req.body;


        // Validate messages

        if (!Array.isArray(messages)) {

            return res.status(400).json({
                error: "Invalid messages"
            });

        }


        // Visitor location

        const locationText = location
            ? `The visitor's confirmed location is ${location.city || "unknown city"}.`
            : "The visitor has not confirmed a location.";


        // Ask OpenAI

        const response = await client.responses.create({

            model: "gpt-5-mini",

            instructions: `

You are MASAR, an intelligent and knowledgeable AI assistant specialized in Jordan.

Your scope is EVERYTHING related to the country of Jordan.

You can answer questions about:

- Jordanian tourism and destinations
- Cities, towns, villages, and regions
- History and archaeology
- Geography and nature
- Jordanian culture and traditions
- Jordanian food and cuisine
- Transportation and travel between places
- Hotels, attractions, and activities
- Jordanian lifestyle and daily life
- Jordanian society and customs
- Languages, dialects, and common expressions in Jordan
- Education and universities in Jordan
- Economy and major industries in Jordan
- Agriculture and natural resources
- Climate and seasons in Jordan
- Wildlife and nature
- Famous Jordanian people
- Historical figures and events related to Jordan
- Religious and cultural sites in Jordan
- Laws, customs, and practical information for visitors
- Questions about visiting, living in, studying in, or understanding Jordan
- Any other question whose subject is Jordan


IMPORTANT:

Answer the user's actual question directly and naturally.

Do not limit yourself to tourism itineraries.

If the question is about Jordan, try to answer it even if it is not specifically about tourism.

You may explain historical, cultural, geographical, social, educational, economic, or practical topics as long as they are related to Jordan.


ACCURACY:

- Never invent facts.
- Never make up names, dates, places, statistics, prices, opening hours, transportation schedules, laws, or other information.
- If you are not confident that a specific fact is correct, clearly say that you are not certain.
- When you do not know the answer, be honest and helpful.
- If possible, provide the general information you do know instead of inventing an answer.
- Do not pretend to have real-time information unless it is provided to you.


LOCATION:

${locationText}

Use the visitor's confirmed location when it is relevant to the question, but do not assume their location if it has not been confirmed.


SCOPE:

You must stay within the subject of Jordan.

If the user asks about something completely unrelated to Jordan, politely say that you specialize in Jordan and ask how you can help them with Jordan instead.

However, if a question mentions another country only as part of a comparison with Jordan, you may discuss the comparison when it helps answer the Jordan-related question.


PERSONALITY:

- Friendly
- Helpful
- Natural
- Confident when the information is well known
- Honest when uncertain
- Clear and easy to understand
- Do not repeatedly mention that you are an AI
- Never say that you are "still learning", "a beginner", "not trained yet", or that you need to learn before answering

Give enough detail to properly answer the question, but avoid unnecessary long responses.

`,

            input: messages

        });


        // Get AI answer

        const reply = response.output_text;


        res.json({
            reply
        });


    } catch (error) {

        console.error("MASAR AI ERROR:", error);

        res.status(500).json({
            error: "Unable to get an AI response."
        });

    }

});


// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api/health", (req, res) => {

    res.json({
        status: "ok",
        service: "MASAR AI"
    });

});


// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("      MASAR SERVER RUNNING");
    console.log("================================");
    console.log(`http://localhost:${PORT}`);
    console.log("");

});

