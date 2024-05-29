import React, { useState } from 'react';
import axios from 'axios';
import { IoMdSend } from "react-icons/io";

export default function Ask() {
  const [input, setInput] = useState('');
  const [stack, setStack] = useState([]);

  const excludedFields = ['greeting', 'question'];  // Add more field names to exclude here

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSendClick = async () => {
    // Add the user's input to the stack before sending the request
    const newPrompt = {
      field: 'prompt',
      response: input,
      role: 'user',
    };
    setStack((prevStack) => [...prevStack, newPrompt]);

    try {
      const response = await axios.post('http://127.0.0.1:5000/getQA', {
        prompt: input,
      });

      // Extract the values from the response object
      const responseData = response.data;
      const extractedResponses = [];

      const parseResponse = (obj) => {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (excludedFields.includes(key)) {
              // Directly add the value for excluded fields
              extractedResponses.push(value);
            } else if (typeof value === 'object' && !Array.isArray(value)) {
              parseResponse(value); // Recursive call for nested objects
            } else {
              extractedResponses.push(value);
            }
          }
        }
      };

      parseResponse(responseData);

      // Add each extracted response to the stack
      extractedResponses.forEach((res) => {
        const newResponse = {
          field: 'response',
          response: Array.isArray(res) ? res.join(', ') : res,
          originalResponse: JSON.stringify(responseData, null, 2),  // JSON encode the original response
          role: 'model'
        };
        setStack((prevStack) => [...prevStack, newResponse]);
      });

      setInput('');  // Clear the input field after sending
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'end', padding: '1rem', gap: '.7rem' }}>
      <div className='message_stack' style={{overflowY: 'scroll'}}>
        {stack.map((entry, index) => (
          <div key={index} style={{ textAlign: entry.role === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: '10px', borderRadius: '10px', margin: '5px', backgroundColor: entry.role === 'user' ? '#E6E6E6' : '#E6E6E6' }}>
              {entry.response}
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', padding: '.6rem 1.2rem', borderRadius: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', boxShadow: '0rem 0rem 2rem rgba(0, 0, 0, 0.237)' }}>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <input style={{ backgroundColor: 'transparent', borderStyle: 'none', width: '100%', outline: 'none' }} type="text" value={input} onChange={handleInputChange} />
          <button style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center', border: 'none', padding: '0rem', fontSize: '1.3rem', transition: '200ms' }} onClick={handleSendClick}><IoMdSend className='send_button' /></button>
        </div>
      </div>
    </div>
  );
}
