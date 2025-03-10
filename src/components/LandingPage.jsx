import { useNavigate } from 'react-router-dom';
import './LandingPage.scss';

function LandingPage() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/flashcard-generator');
    };

    return (
        <div className='landing__container'>
            <header className='landing__header'>
                <h1 className='landing__title'>AI-Powered Flashcard Generator</h1>
                <p className='landing__subtitle'>
                Enter your text or upload a file, and the AI will create flashcards for you.
                </p>
                <button className='landing__cta' onClick={handleStart}>Get Started</button>
            </header>
        </div>
    );
}

export default LandingPage;
