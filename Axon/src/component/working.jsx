import React from 'react'
import { IoDocumentTextSharp } from "react-icons/io5";
import { LuBrainCircuit } from "react-icons/lu";
import { PiExam } from "react-icons/pi";

export default function Working() {
  return (
    <>
    <div style={{display: 'flex', flex: '1', padding: '2rem 1rem'}}>
        <div style={{display: 'flex', flex: '1', flexDirection: 'column', alignItems: 'center'}}>
        <IoDocumentTextSharp style={{fontSize: '3rem'}}/>
        <p>Data Extracted From Doc/Pdf</p>
        </div>

        <div style={{display: 'flex', flex: '1', flexDirection: 'column', alignItems: 'center'}}>
        <LuBrainCircuit style={{fontSize: '3rem'}}/>
        <p>Learn and understand Data</p>
        </div>

        <div style={{display: 'flex', flex: '1', flexDirection: 'column', alignItems: 'center'}}>
        <PiExam style={{fontSize: '3rem'}}/>
        <p>Evaluate and Prepare</p>
        </div>
    </div>
    </>
  )
}
