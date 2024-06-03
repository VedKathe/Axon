import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TiTick } from 'react-icons/ti';
import { IoClose } from 'react-icons/io5';

export default function Quiz() {
  const [quizData, setQuizData] = useState(null);
  const [shuffledQuizData, setShuffledQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [optionColors, setOptionColors] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/getQuiz');
        setQuizData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchQuizData();
  }, []);

  useEffect(() => {
    if (quizData && Array.isArray(quizData.quiz)) {
      const shuffledData = [...quizData.quiz];
      // Shuffle questions
      for (let i = shuffledData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
      }
      // Shuffle options within each question
      shuffledData.forEach((question) => {
        if (Array.isArray(question.options)) {
          for (let i = question.options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [question.options[i], question.options[j]] = [question.options[j], question.options[i]];
          }
        }
      });
      setShuffledQuizData(shuffledData);
    }
  }, [quizData]);

  const handleGenerateClick = async () => {
    try {
      setIsGenerating(true);
      const response = await axios.get('http://127.0.0.1:5000/generateQ');
      setQuizData(response.data);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setScore(0);
      setOptionColors([]);
      setQuizCompleted(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };
  

  const handleOptionClick = (option) => {
    if (selectedOption === null) {
      setSelectedOption(option);
      const newOptionColors = [...optionColors];
      if (option === shuffledQuizData[currentQuestionIndex].answer) {
        setScore(score + 1);
        newOptionColors[currentQuestionIndex] = { [option]: 'lime' };
      } else {
        newOptionColors[currentQuestionIndex] = { [option]: 'red' };
      }
      setOptionColors(newOptionColors);
    }
  };

  const handleNextQuestionClick = () => {
    setSelectedOption(null);
    if (currentQuestionIndex < shuffledQuizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleStartNewQuizClick = () => {
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setOptionColors([]);
    // Shuffle questions again for a new quiz
    const newShuffledData = [...shuffledQuizData];
    for (let i = newShuffledData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newShuffledData[i], newShuffledData[j]] = [newShuffledData[j], newShuffledData[i]];
    }
    setShuffledQuizData(newShuffledData);
  };

  return (
    <>
      <div style={{ backgroundColor: 'white', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'start' }}>
        {shuffledQuizData ? (
          <div style={{ overflowY: 'auto' }}>
            {currentQuestionIndex < shuffledQuizData.length ? (
              <div style={{ padding: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
                  <h1 style={{ fontSize: '1.4rem' }}>
                    {shuffledQuizData[currentQuestionIndex].question}
                  </h1>
                  <div style={{ backgroundColor: 'black', color: 'white', width: 'max-content', padding: '.8rem', borderRadius: '1.2rem', fontSize: '1.2rem', fontWeight: '600', minHeight: '2.5rem', minWidth: '2.5rem', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <p>{score}/{quizData.quiz.length}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '1rem', overflowY: 'hidden' }}>
                  {shuffledQuizData[currentQuestionIndex].options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option" onClick={() => handleOptionClick(option)} style={{ color: 'white', backgroundColor: 'black', minWidth: '13rem', maxWidth: '40%', cursor: selectedOption === null ? 'pointer' : 'not-allowed', borderColor: optionColors[currentQuestionIndex] ? optionColors[currentQuestionIndex][option] : 'black' }} disabled={selectedOption !== null}>
                      {option}
                    </div>
                  ))}
                </div>
                {selectedOption && (
                  <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
                    <div>
                      <p>
                        {selectedOption === shuffledQuizData[currentQuestionIndex].answer ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            <TiTick style={{ color: 'green', display: 'flex', alignItems: 'center', justifyContent: 'center' }} /> <>Correct</>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            <IoClose style={{ color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center' }} /> <>Incorrect</>
                          </div>
                        )}
                      </p>
                      <p style={{ backgroundColor: 'lightgreen', padding: '1rem', borderRadius: '1rem' }}>
                        Explanation: {shuffledQuizData[currentQuestionIndex].explanation}
                      </p>
                    </div>
                    {currentQuestionIndex < shuffledQuizData.length - 1 ? (
                      <div style={{display: 'flex', justifyContent: 'end'}}>
                        <button style={{width: 'max-content', backgroundColor: 'black', color: 'white', padding: '1rem', borderRadius: '.6rem', fontWeight: '600' }} onClick={handleNextQuestionClick}>Next question</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                        <h1 style={{ textAlign: 'center' }}>Quiz completed!</h1>
                        <h2 style={{ textAlign: 'center' }}>
                          Final score: {score} / {shuffledQuizData.length} questions answered.
                        </h2>
                        <button onClick={handleStartNewQuizClick}>Start new quiz</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ textAlign: 'center' }}>Quiz completed!</h1>
                <h2 style={{ textAlign: 'center' }}>
                  Final score: {score} / {shuffledQuizData.length} questions answered.
                </h2>
                <button onClick={handleStartNewQuizClick}>Start new quiz</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: 'rgb(19,19,19)' }}>
            <div style={{ textAlign: 'center', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
              <h1>Generate a quiz</h1>
              <button style={{color: 'white', backgroundColor: 'transparent', border: '.1rem solid white', borderRadius: '.5rem', width: 'max-content', padding : '1rem 2rem', cursor: 'pointer'}} onClick={handleGenerateClick} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}