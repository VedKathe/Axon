import {useState} from 'react'
import PDF from '../component/pdf'
import Ask from '../component/ask'
import Quiz from '../component/quiz'

export default function Dashboard() {

    const [selectedOption, setSelectedOption] = useState('ask')

    const handleOptionClick = (option) => {
      setSelectedOption(option)
    }

  return (
    <>
    <div style={{height: '100vh', width: '100vw', overflowY: 'hidden', display: 'flex'}}>
        <div className='left_div' style={{height: '100%', display: 'flex', flex: '.16', flexDirection: 'column'}}>
            <div className='tab' style={{ width: 'auto', height: 'max-content', padding: '1rem 1.2rem', cursor: 'pointer', userSelect: 'none'}} onClick={() => handleOptionClick('ask')}>AXON</div>
            <div className='tab' style={{ width: 'auto', height: 'max-content', padding: '1rem 1.2rem', cursor: 'pointer', userSelect: 'none'}}  onClick={() => handleOptionClick('analyze')}>Analyze</div>
            <div className='tab' style={{ width: 'auto', height: 'max-content', padding: '1rem 1.2rem', cursor: 'pointer', userSelect: 'none'}}  onClick={() => handleOptionClick('quiz')}>Quiz</div>
        </div>

        <div className='right_div' style={{height: '100%', backgroundColor: 'white', display: 'flex', flex: '1', overflowY: 'hidden'}}>
            {selectedOption === 'analyze' && <PDF />}
            {selectedOption === 'ask' && <Ask />}
            {selectedOption === 'quiz' && <Quiz />}
        </div>
    </div>
    </>
  )
}