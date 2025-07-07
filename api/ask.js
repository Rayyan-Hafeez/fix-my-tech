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
  form.uploadDir = "./";
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      res.status(500).json({ error: "Error parsing form data" });
      return;
    }

    const question = fields.question;
    let imageBase64 = null;

    if (files.image && files.image[0]) {
      const imageFile = files.image[0];
      const imageData = fs.readFileSync(imageFile.filepath, { encoding: "base64" });
      imageBase64 = `data:image/${imageFile.mimetype.split("/")[1]};base64,${imageData}`;
    }

    try {
      const messages = [
        {
          role: "system",
          content:
            "You are a helpful tech support assistant. Analyze any attached image if provided, and give clear step-by-step instructions in a friendly style.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: question },
            ...(imageBase64
              ? [
                  {
                    type: "image_url",
                    image_url: {
                      url: imageBase64,
                    },
                  },
                ]
              : []),
          ],
        },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Use "gpt-4o" or "gpt-4o-mini" if you like
        messages: messages,
      });

      const answer = completion.choices[0].message.content;
      res.status(200).json({ answer });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ error: "OpenAI API error" });
    }
  });
}
