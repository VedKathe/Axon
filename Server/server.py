from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.docstore.document import Document
import fitz
import os

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
if __name__ == '__main__':
    app.run(debug=True)