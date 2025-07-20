import OpenAI from "openai";
import { IncomingForm } from "formidable";
import fs from "fs";

// Disable Vercel's default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      res.status(500).json({ error: "Error parsing form" });
      return;
    }

    const question = fields.question || "";
    let history = [];

    try {
      history = JSON.parse(fields.history || "[]");
    } catch (parseErr) {
      console.warn("History parsing failed, starting fresh.");
      history = [];
    }

    // Add the question to history as user input
    if (question) {
      history.push({
        role: "user",
        content: question,
      });
    }

    // Handle image if uploaded
    if (files.image && files.image[0]) {
      const fileData = fs.readFileSync(files.image[0].filepath);
      const base64Image = fileData.toString("base64");
      const mimetype = files.image[0].mimetype;

      history.push({
        role: "user",
        content: [
          { type: "text", text: question || "Analyze this image." },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimetype};base64,${base64Image}`,
            },
          },
        ],
      });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: history,
      });

      const reply = completion.choices?.[0]?.message?.content || "No response.";
      res.status(200).json({ answer: reply });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ error: "OpenAI API error" });
    }
  });
}
