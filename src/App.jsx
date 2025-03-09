import Flashcard from './components/Flashcard';
import './App.scss';

function App() {
  return (
    <div className="App">
      <Flashcard
        question="What is 2 + 2?"
        answer="4"
      />
    </div>
  );
}

export default App;
