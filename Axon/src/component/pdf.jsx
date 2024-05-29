import React, { useState } from 'react';
import axios from 'axios';
import Ask from './ask';

export default function PDF() {
  const [pdfText, setPdfText] = useState('');
  const [context, setContext] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);
    console.log(fileName.replace(".pdf", ''));
  };

  const handleFileSubmit = async () => {
    const file = document.getElementById("pdfFile").files[0]; // Get file from input element
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('pdfFile', file);

      try {
        setLoading(true); // Set loading state to true
        const response = await axios.post('http://localhost:5000/uploadFile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setPdfText(response.data.response);
        setContext(response.data.context);
        setLoading(false); // Set loading state to false
      } catch (error) {
        alert('Error extracting text from PDF.');
        setLoading(false); // Set loading state to false
      }
    } else {
      alert('Please upload a PDF file.');
    }
  };

  function DownloadJsonFile() {
    if (loading) { // Disable download button if loading
      return;
    }
    const jsonObject = { Data: context };
    const jsonString = JSON.stringify(jsonObject);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName.replace(".pdf", '')+'.json';
    link.click();
  }

  return (
    <div>
      <h1>PDF Text Extraction</h1>
      <input type="file" id="pdfFile" accept="application/pdf" /> {/* Add id attribute to input element */}
      <button onClick={handleFileSubmit}>Send File</button> {/* Add separate button to send file */}
      <button onClick={DownloadJsonFile} disabled={loading || !context}> {/* Disable button if loading or context is empty */}
        {loading ? 'Loading...' : 'Download Context'}{/* Show loading message if loading */}
      </button>
      <pre>{pdfText}</pre>
      <pre>{context}</pre>
      <Ask/>
    </div>
  )
}
