import axios from 'axios';

export async function generateFlashcards(topic, fileContent, numCards) {
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!API_KEY) {
    console.error('API key not found');
    return [];
  }

  // Optionally, truncate fileContent to avoid sending an excessively long prompt.
  const safeFileContent = fileContent ? fileContent.substring(0, 2000) : '';

  const prompt =
    `Generate exactly ${numCards} flashcards for the topic "${topic}". ` +
    (safeFileContent ? `Use the following notes as context: ${safeFileContent}` : "") +
    ` Return only a valid JSON array (with no additional text) where each object has exactly "question" and "answer" keys.`;

  const data = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600, // Increase this value to allow for a complete response
    temperature: 0.7
  };


  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    console.log('Full API response:', res.data);
    const apiOutput = res.data.choices[0].message.content;
    console.log("API output:", apiOutput);

    // Clean up any markdown formatting that might be present.
    const cleanedOutput = apiOutput
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();

    try {
      const flashcards = JSON.parse(cleanedOutput);
      return flashcards;
    } catch (parseError) {
      console.error("Error parsing JSON. Raw output:", cleanedOutput);
      console.error("Parsing error details:", parseError);
      return [];
    }
  } catch (error) {
    console.error("API request error:", error);
    return [];
  }
}
