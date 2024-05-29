import {useState} from 'react'
import PDF from '../component/pdf'
import Ask from '../component/ask'

export default function Dashboard() {

    const [selectedOption, setSelectedOption] = useState('analyze')

    const handleOptionClick = (option) => {
      setSelectedOption(option)
    }

  return (
    <>
    <div style={{height: '100vh', width: '100vw', overflowY: 'hidden', display: 'flex'}}>
        <div className='left_div' style={{height: '100%', backgroundColor: 'grey', display: 'flex', flex: '.2', flexDirection: 'column'}}>
            <div className='tab'  onClick={() => handleOptionClick('analyze')}>Analyze</div>
            <div className='tab' style={{backgroundColor: 'blue', width: '100%', height: 'max-content'}} onClick={() => handleOptionClick('other')}>AXON</div>
        </div>

        <div className='right_div' style={{height: '100%', backgroundColor: 'white', display: 'flex', flex: '1', overflowY: 'scroll'}}>
            {selectedOption === 'analyze' && <PDF />}
            {selectedOption === 'other' && <Ask />}
        </div>
    </div>
    </>
  )
}