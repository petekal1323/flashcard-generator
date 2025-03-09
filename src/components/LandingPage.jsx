import './LandingPage.scss';

function LandingPage(props) {
    return (
        <div className='landing__container'>
            <header className='landing__header'>
                <h1 className='landing__title'>AI-Powered Flashcard Generator</h1>
                <p className='landing__subtitle'>Create flashcards with the help of AI. Just type in the text you want to learn and the AI will generate flashcards for you.</p>
                <p className='landing__subtitle'>Or you can upload a text file and the AI will generate flashcards for you.</p>
                <button className='landing__button' onClick={props.onStart}>Get Started</button>
            </header>
        </div>
    );
}

export default LandingPage;
