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
                <h1 className='landing__title'>AI-Powered Flashcards Made Easy</h1>
                <p className='landing__subtitle'>
                Create customized flashcards instantly—powered by AI.
                </p>
                <button className='landing__cta' onClick={handleStart}>Get Started</button>
            </header>
        </div>
    );
}

export default LandingPage;
