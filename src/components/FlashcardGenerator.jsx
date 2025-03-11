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
  const [errorMessage, setErrorMessage] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === "docx") {
      file.arrayBuffer().then(buffer => {
        mammoth.extractRawText({ arrayBuffer: buffer })
          .then(result => setFileContent(result.value))
          .catch(error => console.error("DOCX parsing error:", error));
      });
    } else if (ext === "pdf") {
      import("pdfjs-dist").then(pdfjsLib => {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const typedarray = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const maxPages = pdf.numPages;
            const pageTexts = [];

            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(" ");
              pageTexts.push(pageText);
            }

            const finalText = pageTexts.join("\n");
            console.log("✅ Final extracted PDF text:", finalText); // Debugging confirmation
            setFileContent(finalText);
          } catch (error) {
            console.error("⚠️ PDF parsing error:", error);
          }
        };
        reader.readAsArrayBuffer(file);
      }).catch(importError => {
        console.error("⚠️ PDFJS import error:", importError);
      });
    } else if (ext === "txt") {
      const reader = new FileReader();
      reader.onload = e => setFileContent(e.target.result);
      reader.onerror = error => console.error("TXT reading error:", error);
      reader.readAsText(file);
    } else {
      alert("Unsupported file type.");
    }
  };

  const handleGenerateFlashcards = async (e) => {
    e.preventDefault();

    if(!topic.trim() && !fileContent.trim()){
      setErrorMessage("Please enter a topic or upload file content.");
      return;
    }
    setErrorMessage("");

    setLoading(true);
    try {
      const generatedFlashcards = await generateFlashcards(topic, fileContent, numCards);
      setFlashcards(generatedFlashcards);
      setCurrentCardIndex(0);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setTopic('');
    setNumCards(10);
    setFileContent('');
    setFlashcards([]);
    setCurrentCardIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const goToNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

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
                onChange={(e) => setNumCards(Number(e.target.value))}
                className="flashcard-generator__input"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="fileInput" className="flashcard-generator__label">Upload notes <i>(optional)</i>. &nbsp;Supported file types: .docx, .pdf, .txt</label>
              <input
                id="fileInput"
                type="file"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="flashcard-generator__file-input"
              />
            </div>

            {errorMessage && <p className="flashcard-generator__error">{errorMessage}</p>}

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
              <Flashcard
                question={flashcards[currentCardIndex].question}
                answer={flashcards[currentCardIndex].answer}
              />
              <div className="flashcard-generator__nav">
                <button className="flashcard-generator__nav-btn" onClick={goToPrevCard} disabled={currentCardIndex === 0}>Prev</button>
                <span>{currentCardIndex + 1}/{flashcards.length}</span>
                <button className="flashcard-generator__nav-btn" onClick={goToNextCard} disabled={currentCardIndex === flashcards.length - 1}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlashcardGenerator;
