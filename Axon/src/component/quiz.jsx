import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Quiz() {
  const [quizData, setQuizData] = useState(null);
  const [shuffledQuizData, setShuffledQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

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
    if (quizData) {
      const shuffledData = [...quizData.quiz];
      for (let i = shuffledData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
      }
      setShuffledQuizData(shuffledData);
    }
  }, [quizData]);

  const handleGenerateClick = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/generateQ');
    } catch (error) {
      console.error(error);
    }
  };

  const handleOptionClick = (option) => {
    if (selectedOption === null) {
      setSelectedOption(option);
      if (option === shuffledQuizData[currentQuestionIndex].answer) {
        setScore(score + 1);
      }
    }
  };

  const handleNextQuestionClick = () => {
    setSelectedOption(null);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  return (
    <>
      <div style={{ backgroundColor: 'white', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div>
          <button onClick={handleGenerateClick}>Generate</button>
        </div>
        {shuffledQuizData && (
          <div style={{ overflowY: 'hidden' }}>
            {currentQuestionIndex < shuffledQuizData.length ? (
              <div style={{ padding: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <h1>{shuffledQuizData[currentQuestionIndex].question}</h1>
                <div style={{display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '1rem', overflowY: 'hidden'}}>
                  {shuffledQuizData[currentQuestionIndex].options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      onClick={() => handleOptionClick(option)}
                      style={{ cursor: selectedOption === null ? 'pointer' : 'not-allowed', display: 'flex', flex: '1' , border: '1px solid balck', borderRadius: '.5rem', padding: '.3rem .7rem'}}
                      disabled={selectedOption !== null}
                    >
                      {option}
                    </div>
                  ))}
                </div>
                {selectedOption && (
                  <div>
                    <p>
                      {selectedOption === shuffledQuizData[currentQuestionIndex].answer
                        ? 'Correct!'
                        : 'Incorrect.'}
                    </p>
                    <p>Explanation: {shuffledQuizData[currentQuestionIndex].explanation}</p>
                    <button onClick={handleNextQuestionClick}>Next question</button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p>Quiz completed!</p>
                <p>Score: {score}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}