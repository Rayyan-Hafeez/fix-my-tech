import OpenAI from "openai";
import { IncomingForm } from "formidable";
import fs from "fs";

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
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "Error parsing form" });
    }

    const question = fields.question || "";
    let history = [];

    try {
      history = JSON.parse(fields.history || "[]");
    } catch (parseErr) {
      console.warn("History parsing failed, using empty history.");
    }

    if (question) {
      history.push({
        role: "user",
        content: question,
      });
    }

    if (files.image && files.image[0]) {
      try {
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
      } catch (fileErr) {
        console.error("File reading error:", fileErr);
      }
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: history,
      });

      const reply = completion.choices?.[0]?.message?.content || "No response.";
      return res.status(200).json({ answer: reply });
    } catch (apiErr) {
      console.error("OpenAI API error:", apiErr);
      return res.status(500).json({ error: apiErr.message || "OpenAI API error" });
    }
  });
}
