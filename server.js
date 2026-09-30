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

// Serve the MASAR website
app.use(express.static(path.join(__dirname, "jordan-tourism")));


// AI endpoint
app.post("/api/masar-chat", async (req, res) => {

    try {

        const { messages, location } = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({
                error: "Invalid messages"
            });
        }

        const locationText = location
            ? `The visitor's confirmed location is ${location.city || "unknown city"}.`
            : "The visitor has not confirmed a location.";

        const response = await client.responses.create({
            model: "gpt-5-mini",

            instructions: `
You are MASAR, a friendly AI tourism guide for Jordan.

Your job is to help visitors discover Jordan.

Focus on:
- Jordanian destinations
- Things to do
- Local food
- Culture
- History
- Trip planning
- Transportation
- General tourism advice
- Nearby attractions when location is provided

Keep answers friendly, useful, confident, and reasonably concise.

You are already knowledgeable about Jordan tourism.
Never say that you are "still learning", "learning", "a beginner",
"not trained yet", or that you need to learn more before answering.

If you are unsure about a specific fact, say that you are not certain
and provide the most useful general guidance you can.

If the user asks something unrelated to Jordan tourism,
politely explain that you specialize in Jordan travel.

Always try to answer tourism questions directly instead of giving
generic statements about being an AI.

Never pretend to know real-time opening hours, prices,
availability, traffic or events unless that information is
actually provided to you.

${locationText}
`,

            input: messages

        });

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


// Simple test route
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "MASAR AI"
    });
});


// Start server
app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("      MASAR SERVER RUNNING");
    console.log("================================");
    console.log(`http://localhost:${PORT}`);
    console.log("");

});