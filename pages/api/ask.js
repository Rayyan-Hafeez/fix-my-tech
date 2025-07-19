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

    const history = JSON.parse(fields.history || "[]");

    let attachments = [];
    if (files.image) {
      const fileData = fs.readFileSync(files.image[0].filepath);
      const base64Image = fileData.toString("base64");
      attachments.push({
        type: "image_url",
        image_url: {
          url: `data:${files.image[0].mimetype};base64,${base64Image}`,
        },
      });
    }

    if (attachments.length > 0) {
      // Add image attachment as last user message if image uploaded
      history.push({
        role: "user",
        content: [
          { type: "text", text: history[history.length - 1]?.content || "Analyze this image." },
          ...attachments,
        ],
      });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: history,
      });

      res.status(200).json({ answer: completion.choices[0].message.content });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ error: "OpenAI API error" });
    }
  });
}
