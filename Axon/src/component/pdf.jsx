import React, { useState } from 'react';
import axios from 'axios';
import { MdOutlineChat } from "react-icons/md";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function PDF() {
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);
  };

  const handleFileSubmit = async () => {
    const file = document.getElementById("pdfFile").files[0]; // Get file from input element
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('file', file);

      try {
        setLoading(true); // Set loading state to true
        const response = await axios.post('http://localhost:5000/uploadFile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setLoading(false); // Set loading state to false
      } catch (error) {
        alert(error.message);
        setLoading(false); // Set loading state to false
      }
    } else {
      alert('Please upload a PDF file.');
    }
  };

  return (
    <>
    <div style={{width: '100%', backgroundColor:'rgb(19,19,19)'}}>

      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{backgroundColor: 'white', boxShadow: '0rem 0rem .4rem rgba(0, 0, 0, 0.237)', padding: '0rem', borderRadius: '.4rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2rem', flexDirection: 'column', justifyContent: 'center'}}>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <input style={{backgroundColor: 'rgb(20, 20, 20)', display: 'flex', flexDirection: 'column', borderRadius: '1rem', color: 'white', padding: '3rem 1rem', border: '.4rem solid white'}} type="file" name="file" id="pdfFile" accept="application/pdf" onChange={handleFileChange} />
            <button style={{backgroundColor: 'transparent', border: 'none', textAlign: 'center'}} onClick={handleFileSubmit}>{loading ? 'Uploading...' : <FaCloudUploadAlt style={{fontSize: '3rem'}} className='send_button' />}</button>
          </div>
        </div>

      </div>

    </div>
    </>
  )
}