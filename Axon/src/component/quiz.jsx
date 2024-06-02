import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TiTick } from "react-icons/ti";
import { IoClose } from "react-icons/io5";

export default function Quiz() {
  const [quizData, setQuizData] = useState(null);
  const [shuffledQuizData, setShuffledQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [optionColors, setOptionColors] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

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
      shuffledData.forEach((question) => {
        for (let i = question.options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [question.options[i], question.options[j]] = [question.options[j], question.options[i]];
        }
      });
      setShuffledQuizData(shuffledData);
    }
  }, [quizData]);

  const handleGenerateClick = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/generateQ');
      setQuizData(response.data);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setScore(0);
      setOptionColors([]);
      setQuizCompleted(false);
    } catch (error) {
      console.error(error);
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
  };

  return (
    <>
      <div style={{ backgroundColor: 'white', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
      {/* <button onClick={handleGenerateClick}>Generate Questions</button> */}
        {shuffledQuizData && (
          <div style={{ overflowY: 'auto' }}>
            {currentQuestionIndex < shuffledQuizData.length ? (
              <div style={{ padding: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem'}}>
                  <h1 style={{fontSize: '1.4rem'}}>{shuffledQuizData[currentQuestionIndex].question}</h1>
                  <div style={{backgroundColor: 'black', color: 'white', width: 'max-content', padding: '1rem', borderRadius: '1.2rem', fontSize: '1.2rem', fontWeight: '600' ,minHeight: '2rem', minWidth: '2rem', alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
                    <p>{score}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: '1rem', overflowY: 'hidden' }}>
                  {shuffledQuizData[currentQuestionIndex].options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className='option'
                      onClick={() => handleOptionClick(option)}
                      style={{
                        color: 'white',
                        backgroundColor: 'black',
                        maxWidth: '40%',
                        cursor: selectedOption === null ? 'pointer' : 'not-allowed',
                        borderColor: optionColors[currentQuestionIndex] ? optionColors[currentQuestionIndex][option] : 'black',
                      }}
                      disabled={selectedOption !== null}
                    >
                      {option}
                    </div>
                  ))}
                </div>
                {selectedOption && (
                  <div style={{display: 'flex', gap: '1.5rem', flexDirection: 'column'}}>
                    <div>
                      <p>
                        {selectedOption === shuffledQuizData[currentQuestionIndex].answer
                          ? <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'}}><TiTick style={{color: 'green', display: 'flex',alignItems: 'center', justifyContent: 'center'}} /> <>Correct</></div>
                          : <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'}}><IoClose style={{color: 'red', display: 'flex',alignItems: 'center', justifyContent: 'center'}} /> <>Incorrect</></div>}
                      </p>
                    <p style={{backgroundColor: 'lightgreen', padding: '1rem', borderRadius: '1rem'}}>Explanation: {shuffledQuizData[currentQuestionIndex].explanation}</p>
                    </div>
                    {currentQuestionIndex < shuffledQuizData.length - 1 ? (
                      <button onClick={handleNextQuestionClick}>Next question</button>
                    ) : (
                      <>
                        <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
                          <h1 style={{textAlign: 'center'}}>Quiz completed!</h1>
                          <h2 style={{textAlign: 'center'}}>Final score: {score} / {shuffledQuizData.length} questions answered.</h2>
                          <button style={{backgroundColor: 'black', color: 'white', width: 'max-content', padding: '1rem', borderRadius: '1.2rem', fontSize: '1.2rem', fontWeight: '600', alignItems: 'center', justifyContent: 'center', display: 'flex'}} onClick={handleStartNewQuizClick}>Start new quiz</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h1>Quiz completed!</h1>
                <h2>Final score: {score} / {shuffledQuizData.length} questions answered.</h2>
                <button onClick={handleStartNewQuizClick}>Start new quiz</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}