export async function generateFlashcards(topic, fileContent, numCards){
    await new Promise((resolve) => setTimeout(resolve, 500));

    const flashcards = [];
    for(let i = 0; i < numCards; i++){
        flashcards.push({
            question: `Question ${i + 1} about ${topic}`,
            answer: `Answer ${i + 1}`
        });
    }
    console.log("Generated flashcards:", flashcards);
    return flashcards;
}