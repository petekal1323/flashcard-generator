import { useState, useRef } from "react";
import Flashcard from "./Flashcard";
import { generateFlashcards } from "../api/openai";
import Spinner from "./Spinner";
import "./FlashcardGenerator.scss";
import mammoth from "mammoth";

function FlashcardGenerator() {
  const [topic, setTopic] = useState('');
  const [numCards, setNumCards] = useState(10);
  const [fileContent, setFileContent] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Ref for the file input so we can clear its value on reset
  const fileInputRef = useRef(null);

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Get file extension
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === "docx") {
      // Process DOCX files using Mammoth
      file.arrayBuffer().then(buffer => {
        mammoth.extractRawText({ arrayBuffer: buffer })
          .then(result => {
            console.log("Extracted DOCX text:", result.value);
            setFileContent(result.value);
          })
          .catch(error => console.error("Error parsing DOCX:", error));
      });
    } else if (ext === "pdf") {
      // Process PDF files using pdfjs-dist (loaded dynamically)
      import("pdfjs-dist").then(pdfjsLib => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
        const reader = new FileReader();
        reader.onload = function () {
          const typedarray = new Uint8Array(this.result);
          pdfjsLib.getDocument(typedarray).promise.then(pdf => {
            let promises = [];
            for (let i = 1; i <= pdf.numPages; i++) {
              promises.push(
                pdf.getPage(i).then(page =>
                  page.getTextContent().then(textContent => {
                    return textContent.items.map(item => item.str).join(" ");
                  })
                )
              );
            }
            Promise.all(promises).then(pagesText => {
              const allText = pagesText.join("\n");
              console.log("Extracted PDF text:", allText);
              setFileContent(allText);
            });
          }).catch(error => console.error("Error loading PDF:", error));
        };
        reader.onerror = function (error) {
          console.error("Error reading PDF:", error);
        };
        reader.readAsArrayBuffer(file);
      });
    } else if (ext === "txt") {
      // Process TXT files using FileReader
      const reader = new FileReader();
      reader.onload = function (e) {
        console.log("Extracted TXT text:", e.target.result);
        setFileContent(e.target.result);
      };
      reader.onerror = function (error) {
        console.error("Error reading TXT file:", error);
      };
      reader.readAsText(file);
    } else {
      console.error("Unsupported file type:", ext);
    }
  }

  async function handleGenerateFlashcards(e) {
    e.preventDefault();
    console.log("Generating flashcards...");
    console.log("Topic:", topic);
    console.log("File Content Length:", fileContent.length);
    console.log("Number of Cards:", numCards);
    setLoading(true);
    try {
      const generatedFlashcards = await generateFlashcards(topic, fileContent, numCards);
      console.log("Flashcards:", generatedFlashcards);
      setFlashcards(generatedFlashcards);
      setCurrentCardIndex(0);
    } catch (error) {
      console.error("Error generating flashcards:", error);
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

  // Reset all state values and clear the file input
  function handleReset() {
    setTopic('');
    setNumCards(10);
    setFileContent('');
    setFlashcards([]);
    setCurrentCardIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div id="flashcard-generator__container">
      <div className="flashcard-generator">
        <h2 className="flashcard-generator__title">Generate Your Flashcards</h2>
        <div className="flashcard-generator__form-display-container">
          <form className="flashcard-generator__form" onSubmit={handleGenerateFlashcards}>
            <div>
              <label htmlFor="topicInput" className="flashcard-generator__label">Enter a topic</label>
              <input
                id="topicInput"
                type="text"
                placeholder="Enter a topic (e.g., World History)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flashcard-generator__input"
              />
            </div>
            <div>
              <label htmlFor="numCardsInput" className="flashcard-generator__label">How many flashcards?</label>
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
                ref={fileInputRef}
                className="flashcard-generator__file-input"
              />
            </div>
            <div className="flashcard-generator__btn-container">
              <button type="submit" className="flashcard-generator__btn--generate" disabled={loading}>
                {loading ? "Generating..." : "Generate Flashcards"}
              </button>
              <button type="button" onClick={handleReset} className="flashcard-generator__btn--reset">Reset</button>
            </div>
          </form>

          {loading && <Spinner />}

          {!loading && flashcards.length > 0 && (
            <div className="flashcard-generator__display">
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default FlashcardGenerator;
