from flask import Flask, request, jsonify
import fitz
from flask_cors import CORS 
from dotenv import load_dotenv
import os
import re
import requests
import json

app = Flask(__name__)

CORS(app)
load_dotenv()

Ollama_url = os.getenv('OLLAMA_ENDPOINT')
CONTEXT = []

#preprocess Data
def remove_white_spaces(text):
    # Remove extra white spaces
    text = re.sub(r'\s+', ' ', text)
    # Add newline after each period if the period is followed by a space
    text = re.sub(r'\. (?=[A-Z])', '.\n', text)
    return text.strip()

#chunk Data
def chunk_text(text, chunk_size=200):
    words = text.split()
    return [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

#################################################################################
#################################################################################
@app.route('/')
def execute():
    return 'Hello, World!'
#################################################################################
#################################################################################
@app.route('/uploadFile', methods=['POST'])
def uploadFile():
    global CONTEXT

    if 'pdfFile' not in request.files:
        return jsonify({'response': 'No file part'}), 400

    file = request.files['pdfFile']

    if file.filename == '':
        return jsonify({'response': 'No selected file'}), 400

    if file and file.filename.endswith('.pdf'):
        pdf_text = extract_text_from_pdf(file)

        # Chunk the text into sizes of 200 words
        CONTEXT = []  # Reset the CONTEXT variable for each new file
        chunks = chunk_text(pdf_text)

        # Send each chunk of text to Ollama to generate embeddings and wait for the response
        for i, chunk in enumerate(chunks):
            print(f"Sending chunk {i+1} of {len(chunks)}...")
            ollama_data = {
                "model": "mistral",
                "prompt": chunk,
                "stream": False,
            }

            ollama_response = requests.post(Ollama_url, json=ollama_data)
            response = ollama_response.json()
            context = response['context']
            print(f"Received context for chunk {i+1}.")

            # Store the context for the chunk in the CONTEXT array
            CONTEXT.extend(context)

        # Write the CONTEXT variable to a JSON file in the project root
        with open('context.json', 'w') as f:
            # Write a JSON object to the file
            json_obj = {'Data': CONTEXT}
            json.dump(json_obj, f)

        return jsonify({
            'response': remove_white_spaces(pdf_text),
            'context': CONTEXT
        }), 200

    return jsonify({'response': 'Invalid file format. Please upload a PDF file.'}), 400

def extract_text_from_pdf(file):
    text = ''
    with fitz.open(stream=file.read(), filetype="pdf") as pdf_document:
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            text += page.get_text()
    return text
#################################################################################
#################################################################################
CORS(app)
@app.route('/getQA', methods=['POST'])
def getQA():
    global CONTEXT

    project_dir = os.path.dirname(os.path.abspath(__file__))
    context_file_path = os.path.join(project_dir, 'context.json')

    # Get the prompt from the request body
    data = request.get_json()
    prompt = data.get('prompt')

    with open(context_file_path, 'r') as f:
        context = json.load(f)

    # Get the value of the 'Data' field
    context_data = context.get('Data', None)

    # Print the value of the 'Data' field, or a message if it's not found
    if context_data is not None:
        print(context_data)
    else:
        print("'Data' field not found in context.json")

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    # Pass the prompt and context to the Ollama API
    url = 'http://localhost:11434/api/generate'
    headers = {'Content-Type': 'application/json'}
    post_data = {
                    'model': 'mistral',
                    'prompt': prompt,
                    "stream": False,
                    "context": context_data,  # Use the JSON-formatted string here
                    'format': 'json',
                }
    response = requests.post(url, headers=headers, json=post_data)

    if response.status_code != 200:
        return jsonify({'error': 'Failed to generate response from Ollama'}), 500

    # Extract the generated response from the Ollama API response
    generated_response = response.json().get('response')

    # Use the CONTEXT variable to generate the final response
    # (You can add your own logic here to generate the response)
    final_response = f"{generated_response}"

    return jsonify({'response': final_response}), 200
#################################################################################
#################################################################################
if __name__ == '__main__':
    app.run(debug=False)
