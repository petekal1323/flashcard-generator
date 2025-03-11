import axios from 'axios';

export async function generateFlashcards(topic, fileContent, numCards) {
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!API_KEY) {
    console.error('API key not found');
    return [];
  }

  const safeFileContent = fileContent ? fileContent.substring(0, 2000) : '';

  const prompt =
    `Generate exactly ${numCards} flashcards for the topic "${topic}". ` +
    (safeFileContent ? `Use the following notes as context: ${safeFileContent}` : "") +
    ` Return only a valid JSON array (with no additional text) where each object has exactly "question" and "answer" keys.`;

  const data = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2000,
    temperature: 0.7
  };

  try {
    const res = await axios.post("https://api.openai.com/v1/chat/completions", data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const apiOutput = res.data.choices[0].message.content.trim().replace(/^```(?:json)?|```$/g, '');
    return JSON.parse(apiOutput);
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}
