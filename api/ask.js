import OpenAI from "openai";
import formidable from "formidable";
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

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      res.status(500).json({ error: "Error parsing form" });
      return;
    }

    const question = fields.question;
    const imageFile = files.image;

    if (!question && !imageFile) {
      res.status(400).json({ error: "Question or image is required" });
      return;
    }

    let messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant providing step-by-step tech support for PCs and mobile devices. If an image is provided, analyze it and include possible visual hints.",
      },
      {
        role: "user",
        content: question || "Analyze the attached image.",
      },
    ];

    let attachments = [];

    if (imageFile) {
      const fileData = fs.readFileSync(imageFile[0].filepath);
      const base64Image = fileData.toString("base64");

      attachments.push({
        type: "image_url",
        image_url: {
          url: `data:${imageFile[0].mimetype};base64,${base64Image}`,
        },
      });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Make sure your API key and account have access to vision (GPT-4o supports image input)
        messages: attachments.length
          ? [
              {
                role: "user",
                content: [
                  { type: "text", text: question },
                  ...attachments,
                ],
              },
            ]
          : messages,
      });

      res.status(200).json({ answer: completion.choices[0].message.content });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ error: "OpenAI API error" });
    }
  });
}
