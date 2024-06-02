from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.docstore.document import Document
import fitz
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
chroma_db_dir = os.path.join(os.path.dirname(__file__), "chroma_db")
vectorstore = Chroma(persist_directory=chroma_db_dir, embedding_function=OllamaEmbeddings(model="nomic-embed-text"))

#FUNCTIONS
def extract_text_from_pdf(pdf_file):
    doc = fitz.open(stream=pdf_file.read(), filetype='pdf')
    text = ''
    for page in doc:
        text += page.get_text()
    return text

def ollama_llm(question, context):
    formatted_prompt = f"Question: {question}\n\n Context: {context}"
    response = ollama.generate(model='mistral', prompt=formatted_prompt, stream=False)
    return response['response']

def combine_doc(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def rag_chain(question):
    if vectorstore is None:
        return "No vector store has been created. Please upload a file first."
    retriever = vectorstore.as_retriever()
    retrieved_doc = retriever.invoke(question)
    formatted_context = combine_doc(retrieved_doc)
    return ollama_llm(question, formatted_context)

def question_chain(question):
    if vectorstore is None:
        return "No vector store has been created. Please upload a file first."
    retriever = vectorstore.as_retriever()
    retrieved_doc = retriever.invoke(question)
    formatted_context = combine_doc(retrieved_doc)
    return ollama_llm(question, formatted_context)

import json

def saveQuestionData(response):
    # Parse the response string into a JSON object
    new_data = json.loads(response)

    # Load the existing data from the file
    try:
        with open("questions.json", "r") as f:
            existing_data = json.load(f)
    except FileNotFoundError:
        existing_data = {"quiz": []}

    # Extend the existing data with the new questions
    existing_data["quiz"].extend(new_data["quiz"])

    # Write the updated data back to the file
    with open("quiz_data.json", "w") as f:
        json.dump(existing_data, f)
############################################################################################
############################################################################################
@app.route('/uploadFile', methods=['POST'])
def upload_file():
    global vectorstore
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        pdf_text = extract_text_from_pdf(file)
        text_chunker = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50)
        chunked_text = text_chunker.split_text(pdf_text)
        documents = [Document(page_content=chunk) for chunk in chunked_text]
        print(chunked_text)

        embeddings = OllamaEmbeddings(model="nomic-embed-text")
        vectorstore = Chroma.from_documents(documents=documents, embedding=embeddings, persist_directory="chroma_db")
        return jsonify({'embeddings': embeddings.embed_documents(chunked_text)})
############################################################################################
############################################################################################
@app.route('/getQA', methods=['POST'])
def getQA():
    data = request.get_json()
    prompt = data.get('prompt')

    response = rag_chain(prompt)
    return jsonify({'response': response})
############################################################################################
############################################################################################
@app.route('/generateQ', methods=['GET'])
def generateQ():
    response = question_chain('Create a multiple-choice questionnaire with exactly 10 questions using the given data format, each question should have four options, one correct answer, and an explanation for why the answer is correct; Input Data Format: [{ "question": "Sample question 1", "option": ["Option 1", "Option 2", "Option 3", "Option 4"], "answer": "Option 1", "explanation": "Explanation for why Option 1 is correct" }, { "question": "Sample question 2", "option": ["Option 1", "Option 2", "Option 3", "Option 4"], "answer": "Option 4", "explanation": "Explanation for why Option 4 is correct" }, ...] ; Output Data Format: { "quiz": [{ "question": "Question: [Your question here]", "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "answer": "Correct Answer", "explanation": "Explanation for why the correct answer is correct." }, ... { "question": "Question: [Your question here]", "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "answer": "Correct Answer", "explanation": "Explanation for why the correct answer is correct." }] }; Ensure the output data contains exactly 10 questions following the format provided.')
    saveQuestionData(response)
    return jsonify({'response': "Question generated"})
############################################################################################
############################################################################################
@app.route('/getQuiz', methods=['GET'])
def getQuiz():
    try:
        with open("quiz_data.json", "r") as f:
            existing_data = json.load(f)
            return existing_data
    except FileNotFoundError:
        existing_data = {"quiz": []}
        return {'error':"File not loaded"}
############################################################################################
############################################################################################
if __name__ == '__main__':
    app.run(debug=True)