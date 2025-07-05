import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question } = req.body;
  if (!question) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant providing step-by-step tech support for PCs and mobile devices."
        },
        {
          role: "user",
          content: question
        }
      ],
    });

    res.status(200).json({ answer: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: 'OpenAI API error' });
  }
}




