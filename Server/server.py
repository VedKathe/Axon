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
    project_dir = os.path.dirname(os.path.abspath(__file__))
    context_file_path = os.path.join(project_dir, 'context.json')

    if 'pdfFile' not in request.files:
        return jsonify({'response': 'No file part'}), 400

    file = request.files['pdfFile']

    if file.filename == '':
        return jsonify({'response': 'No selected file'}), 400

    if file and file.filename.endswith('.pdf'):
        pdf_text = extract_text_from_pdf(file)

        # Chunk the text into sizes of 200 words
        chunks = chunk_text(pdf_text)

        # Initialize an empty list for the new context
        new_context = []

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

            # Store the context for the chunk in the new_context list
            new_context.extend(context)

        # Load the existing context from context.json, if it exists
        if os.path.isfile(context_file_path):
            with open(context_file_path, 'r') as f:
                context = json.load(f)
                existing_context = context.get('Data', [])
        else:
            existing_context = []

        # Extend the existing context with the new context
        updated_context = existing_context + new_context

        # Write the updated context to the context.json file
        with open(context_file_path, 'w') as f:
            json_obj = {'Data': updated_context}
            json.dump(json_obj, f)

        return jsonify({
            'response': remove_white_spaces(pdf_text),
            'context': updated_context
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
    project_dir = os.path.dirname(os.path.abspath(__file__))
    context_file_path = os.path.join(project_dir, 'context.json')

    # Get the prompt from the request body
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    # Check if context.json file exists, if not, create an empty one
    if not os.path.isfile(context_file_path):
        with open(context_file_path, 'w') as f:
            json.dump({}, f)
        return jsonify({'message': 'context.json file created'}), 200

    # Load the context from context.json
    try:
        with open(context_file_path, 'r') as f:
            context = json.load(f)
    except json.JSONDecodeError:
        return jsonify({'error': 'Error decoding context.json'}), 500

    # Get the value of the 'Data' field
    context_data = context.get('Data', None)

    if context_data is None:
        return jsonify({'error': "'Data' field not found in context.json"}), 500

    # Pass the prompt and context to the Ollama API
    url = 'http://localhost:11434/api/generate'
    headers = {'Content-Type': 'application/json'}
    post_data = { 
        'model': 'mistral',
        'prompt': prompt,
        "stream": False,
        "context": context_data,
        "template": "Use the following pieces of information to awnser the quiestions given as prompt, also only awnser to the point, nothing extra."
    }

    response = requests.post(url, headers=headers, json=post_data)

    if response.status_code != 200:
        return jsonify({'error': 'Failed to generate response from Ollama'}), 500

    # Extract the generated response from the Ollama API response
    response_json = response.json()
    generated_response = response_json.get('response')

    if generated_response is None:
        return jsonify({'error': 'No response from Ollama API'}), 500

    # Generate the final response
    final_response = generated_response

    return jsonify({'response': final_response}), 200
#################################################################################
#################################################################################
if __name__ == '__main__':
    app.run(debug=False)