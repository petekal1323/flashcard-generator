import axios from 'axios';

export async function generateFlashcards(topic, fileContent, numCards) {

  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!API_KEY) {
    console.error('API key not found');
    return [];
  }


  const prompt =
    `Generate ${numCards} flashcards for the topic "${topic}". ` +
    (fileContent ? `Use the following notes as context: ${fileContent}` : "") +
    ` Return the result as a JSON array where each object has "question" and "answer" keys.`;

  const data = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
    temperature: 0.7
  };

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",data,
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

    if(!apiOutput || apiOutput.trim() === "") {
      console.error("API response was empty");
      return [];
    }

    try {
      // Parse the API output as JSON.
      const flashcards = JSON.parse(apiOutput);
      return flashcards;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("API request error:", error);
    return [];
  }
}
