import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import FlashcardGenerator from './components/FlashcardGenerator';
import './App.scss';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/flashcard-generator" element={<FlashcardGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;