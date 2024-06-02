# Axon

LLM Powered Learning Assistant

Chat, analyze, and test your knowledge on any topic.

## Features
- **Custom Models**: Tailor the learning assistant to your needs.
- **Powered by Ollama and LangChain**: Utilize state-of-the-art language models.
- **Easy to Use**: User-friendly interface and functionality.
- **Export/Import Knowledge**: Seamlessly transfer knowledge between users.
- **Query Documents**: Use Retrieval-Augmented Generation (RAG) and Document Query for in-depth analysis.

## Prerequisites

1. **Install Ollama**
   - [Download Ollama](https://www.ollama.com/download)

2. **Run Python Server**
   - Navigate to the `/Server` directory
   - Run the command: ```python server.py```

3. **Run React App**
   - Navigate to the `/Axon` directory
   - Run the command: ```npm run dev```
  
To install the necessary dependencies,

2. **Install Dependencies**
   - Run the following command in your terminal:
     ```bash
     pip install -r requirements.txt
     ```

This will install all the required packages for the Axon application.

## Usage

1. **Import a PDF File**
   - Import a PDF file with data into Axon.
   - Wait for it to finish processing (note: it might take some time, but be patient).

2. **Analyze and Generate Questions**
   - After the PDF is processed, click on "Analyze" to generate questions for the quiz.
   - Note: You can generate as many questions as needed. There might be some inconsistencies and false information, so review the generated questions carefully.
