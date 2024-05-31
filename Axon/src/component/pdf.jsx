import React, { useState } from 'react';
import axios from 'axios';
import { MdOutlineChat } from "react-icons/md";
import { FaCloudUploadAlt } from "react-icons/fa";

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
    <>
    <div style={{width: '100%'}}>

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{backgroundColor: 'white', boxShadow: '0rem 0rem .4rem rgba(0, 0, 0, 0.237)', padding: '1.7rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2rem', flexDirection: 'column', justifyContent: 'center'}}>
          <div style={{ display: 'flex', alignItems: "center"}}>
            <MdOutlineChat />
            <p style={{fontFamily: 'Kanit, sans-serif', fontWeight: '800', fontStyle: 'italic'}}> AXON</p>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <input style={{backgroundColor: 'rgb(20, 20, 20)', display: 'flex', flexDirection: 'column', borderRadius: '1rem', color: 'white', padding: '3rem 1rem', border: '.4rem solid white'}} type="file" id="pdfFile" accept="application/pdf" />
            <button style={{backgroundColor: 'transparent', border: 'none', textAlign: 'center'}} onClick={handleFileSubmit}>{loading ? 'Sending...' : <FaCloudUploadAlt style={{fontSize: '3rem'}} className='send_button' />}</button>
          </div>
        </div>

      </div>

    </div>
    </>
  )
}
