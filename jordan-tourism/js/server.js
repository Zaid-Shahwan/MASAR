import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

/* ==================================================
   SERVER
================================================== */

const app = express();
const PORT = process.env.PORT || 3000;


/* ==================================================
   PATH
================================================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* ==================================================
   GEMINI
================================================== */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing.");
}

const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});


/* ==================================================
   MIDDLEWARE
================================================== */

app.use(express.json());

/* ==================================================
   MAP CONFIG (CARTO key from .env)
   The browser can't read .env, so the server serves
   js/config.js with the key filled in. This route must
   stay ABOVE express.static so it takes priority.
================================================== */

app.get("/js/config.js", (req, res) => {

    const cartoKey =
        process.env.CARTO_API_KEY ||
        process.env.CARTO_KEY ||
        "";

    res.type("application/javascript");
    res.set("Cache-Control", "no-store");

    res.send(
        "window.MASAR_ENV = " +
        JSON.stringify({ CARTO_API_KEY: cartoKey }) +
        ";"
    );

});

/* Serve MASAR website */
app.use(express.static(path.join(__dirname, "jordan-tourism")));


/* ==================================================
   MASAR AI
================================================== */

app.post("/api/masar-chat", async (req, res) => {

    try {

        const { messages, location } = req.body;


        /* ==================================================
           VALIDATE REQUEST
        ================================================== */

        if (!Array.isArray(messages) || messages.length === 0) {

            return res.status(400).json({
                error: "Invalid messages."
            });

        }


        if (!GEMINI_API_KEY) {

            return res.status(500).json({
                error: "Gemini API key is not configured."
            });

        }


        /* ==================================================
           LOCATION
        ================================================== */

        const locationText = location
            ? `The visitor's confirmed location is ${
                location.city || "unknown city"
              }.`
            : "The visitor has not confirmed a location.";


        /* ==================================================
           MASAR SYSTEM INSTRUCTIONS
        ================================================== */

        const systemInstruction = `
You are MASAR, the AI guide for Jordan.

Your job is to answer questions about EVERYTHING related to Jordan.

You are not limited to tourism.

You can answer questions about:

- Tourism and destinations
- Cities, towns and villages
- Petra
- Amman
- Aqaba
- Wadi Rum
- Jerash
- Madaba
- Salt
- Karak
- Ajloun
- History
- Archaeology
- Geography
- Nature
- Wildlife
- Jordanian culture
- Jordanian traditions
- Jordanian food
- Mansaf
- Restaurants and local food
- Transportation
- Travel between cities
- Hotels
- Attractions
- Activities
- Jordanian lifestyle
- Jordanian society
- Jordanian customs
- Arabic dialects in Jordan
- Jordanian expressions
- Universities in Jordan
- Education
- Economy
- Agriculture
- Natural resources
- Climate
- Famous Jordanian people
- Historical figures
- Historical events
- Religious sites
- Cultural sites
- Laws and customs relevant to visitors
- Studying in Jordan
- Living in Jordan
- Visiting Jordan
- Any other subject specifically related to Jordan.


IMPORTANT:

Answer the visitor's actual question directly.

Do not automatically turn every question into a travel itinerary.

If someone asks about universities, answer about universities.

If someone asks about food, answer about food.

If someone asks about history, answer about history.

If someone asks about culture, answer about culture.

If someone asks about Jordanian society, answer about Jordanian society.


ACCURACY:

Never invent facts.

Never invent:

- Names
- Dates
- Statistics
- Prices
- Opening hours
- Transportation schedules
- Laws
- Addresses
- Events
- People
- Universities
- Historical information

If you are uncertain about a specific fact, say that you are not certain.

If you do not know something, say so honestly.

Never make up information simply to provide an answer.

Do not claim to have real-time information unless it is explicitly provided.


SCOPE:

Your main subject is Jordan.

If the user asks about something completely unrelated to Jordan,
politely explain that MASAR specializes in Jordan and redirect them
toward something related to Jordan.

If another country is mentioned as part of a comparison involving Jordan,
you may discuss the comparison when it helps answer the question.


PERSONALITY:

Be:

- Friendly
- Helpful
- Natural
- Clear
- Direct
- Informative
- Easy to understand

Do not repeatedly say that you are an AI.

Never say:

"I'm still learning."

"I'm a beginner."

"I need to learn this."

"I'm not trained yet."

"I don't know much about this."

Do not use generic fallback responses when you can answer the question.


LANGUAGE:

Answer in the same language as the visitor whenever possible.

If the visitor asks in Arabic, answer in Arabic.

If the visitor asks in English, answer in English.

If the visitor mixes Arabic and English, naturally mix both.


LOCATION:

${locationText}

Use the visitor's confirmed location only when it is relevant.

Never assume a location that has not been confirmed.


RESPONSE STYLE:

Answer directly.

Use short paragraphs and bullet points when useful.

Do not unnecessarily repeat the question.

Do not add a generic introduction before every answer.

Give enough information to properly answer the question.
`;


        /* ==================================================
           CONVERT CHAT HISTORY
        ================================================== */

        const conversation = messages
            .slice(-10)
            .map((message) => {

                const role =
                    message.role === "assistant"
                        ? "MASAR"
                        : "Visitor";

                return `${role}: ${message.content}`;

            })
            .join("\n\n");


        /* ==================================================
           GEMINI REQUEST
        ================================================== */

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash-lite",

            config: {
                systemInstruction: systemInstruction,
                temperature: 0.4
            },

            contents: conversation

        });


        /* ==================================================
           GET RESPONSE
        ================================================== */

        const reply = response.text;


        if (!reply || !reply.trim()) {

            return res.status(500).json({
                error: "Gemini returned an empty response."
            });

        }


        /* ==================================================
           SEND RESPONSE
        ================================================== */

        res.json({
            reply: reply.trim()
        });


    } catch (error) {

        console.error("================================");
        console.error("MASAR GEMINI ERROR");
        console.error("================================");

        console.error(error);


        /* ==================================================
           FRIENDLY ERROR RESPONSES
        ================================================== */

        if (
            error?.status === 429 ||
            error?.code === 429 ||
            error?.message?.includes("RESOURCE_EXHAUSTED")
        ) {

            return res.status(429).json({
                error: "MASAR AI is temporarily busy. Please try again in a moment."
            });

        }


        if (
            error?.message?.includes("API key") ||
            error?.message?.includes("API_KEY")
        ) {

            return res.status(500).json({
                error: "MASAR AI configuration error."
            });

        }


        res.status(500).json({
            error: "Unable to get an AI response right now."
        });

    }

});


/* ==================================================
   HEALTH CHECK
================================================== */

app.get("/api/health", (req, res) => {

    res.json({
        status: "ok",
        service: "MASAR AI",
        provider: "Google Gemini",
        model: "gemini-3.5-flash-lite"
    });

});


/* ==================================================
   START SERVER
================================================== */

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("      MASAR SERVER RUNNING");
    console.log("================================");
    console.log(`http://localhost:${PORT}`);
    console.log("AI Provider: Google Gemini");
    console.log("AI Model: gemini-3.5-flash-lite");
    console.log("");

});
