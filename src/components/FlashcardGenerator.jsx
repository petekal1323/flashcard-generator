import { useState } from "react";
import Flashcard from './Flashcard';
import { generateFlashcards } from '../api/openai';
import Spinner from './Spinner';
import './FlashcardGenerator.scss';

function FlashcardGenerator() {
    const [topic, setTopic] = useState('');
    const [numCards, setNumCards] = useState(10);
    const [fileContent, setFileContent] = useState('');
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const fileReader = new FileReader();

        fileReader.onload = (e) => {
            setFileContent(e.target.result);
        };

        fileReader.readAsText(file);
    }

    async function handleGenerateFlashcards(e) {
        e.preventDefault();
        console.log("Form submitted. Generating flashcards...");
        console.log("Topic:", topic);
        console.log("File Content:", fileContent);
        console.log("Number of Cards:", numCards);

        setLoading(true);

        try {
            const generatedFlashcards = await generateFlashcards(topic, fileContent, numCards);
            console.log("HandleGenerate got flashcards:", generatedFlashcards);
            setFlashcards(generatedFlashcards);
            setCurrentCardIndex(0);

        } catch (error) {
            console.error('Error generating flashcards:', error);
        }
        setLoading(false);
    }

    function goToNextCard() {
        if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        }
    }

    function goToPrevCard() {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
        }

    }



    return (
        <div className='flashcard-generator'>
            <h2 className='flashcard-generator__title'>Generate Your Flashcards</h2>
            <form className="flashcard-generator__form" onSubmit={handleGenerateFlashcards}>
                <div>
                <label htmlFor="topicInput" className="flashcard-generator__label">Enter a topic</label>
                <input
                    id="topicInput"
                    type="text"
                    placeholder="Enter a topic (like World History)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flashcard-generator__input"
                    required
                />
                </div>

                <div>
                <label htmlFor="numCardsInput" className="flashcard-generator__label">How many flashcards do you want?</label>
                <input
                    id="numCardsInput"
                    type="number"
                    value={numCards}
                    onChange={(e) => setNumCards(e.target.value)}
                    className="flashcard-generator__input"
                    min="1"
                />
                </div>

                <div>
                <label htmlFor="fileInput" className="flashcard-generator__label">Upload notes (optional)</label>
                <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileUpload}
                    className="flashcard-generator__file-input"
                />
                </div>

                <button
                    type="submit"
                    className="flashcard-generator__btn"
                    disabled={loading} //disable the btn when loading
                >
                    {loading ? 'Generating...' : 'Generate Flashcards'}
                </button>
            </form>

            <div className="flashcard-generator__display">
        {loading ? (
          <Spinner />
        ) : flashcards.length > 0 ? (
          <div className="flashcard-generator__flashcard-container">
            <Flashcard
              question={flashcards[currentCardIndex].question}
              answer={flashcards[currentCardIndex].answer}
            />
            <div className="flashcard-generator__nav">
              <button
                onClick={goToPrevCard}
                disabled={currentCardIndex === 0}
                className="flashcard-generator__nav-btn"
              >
                Prev
              </button>
              <span className="flashcard-generator__nav-count">
                {currentCardIndex + 1} / {flashcards.length}
              </span>
              <button
                onClick={goToNextCard}
                disabled={currentCardIndex === flashcards.length - 1}
                className="flashcard-generator__nav-btn"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="flashcard-generator__no-cards">
            Enter a topic and upload notes (optional), then click "Generate Flashcards"
          </p>
        )}
      </div>
    </div>
  );
}

export default FlashcardGenerator;