import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Ask() {
  const [input, setInput] = useState('')
  const [file, setFile] = useState(null)
  const [data, setData] = useState(null)

  const handleInputChange = (event) => {
    setInput(event.target.value)
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  useEffect(() => {
    if (data) {
      console.log(data) // log the parsed JSON content to the console
    }
  }, [data])

  const handleFileRead = () => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const json = JSON.parse(event.target.result)
      setData(json.Data)
    }
    reader.readAsText(file)
  }

  const handleSendClick = () => {
    axios.post('http://127.0.0.1:5000/getQA', {
      prompt: input,
      context: data
    })
  }

  return (
    <div>
      <input type="text" value={input} onChange={handleInputChange} />
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button onClick={handleFileRead}>Read JSON</button>
      <button onClick={handleSendClick}>Send</button>
    </div>
  )
}
