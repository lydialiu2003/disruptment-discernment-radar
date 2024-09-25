from flask import Flask, request, jsonify, render_template
import pandas as pd
import re

app = Flask(__name__)

# Load words from a specific Excel file
def load_words_from_excel(file_path):
    df = pd.read_excel(file_path, header=None, engine='openpyxl')  # Assuming no header
    return df[0].dropna().tolist()  # Extract the first column

# Load the word lists from individual Excel files
individualistic_words = load_words_from_excel('data/individual_keywords.xlsx')
communal_words = load_words_from_excel('data/communal_keywords.xlsx')
change_seeking_words = load_words_from_excel('data/seeking_words.xlsx')
change_averse_words = load_words_from_excel('data/averse_words.xlsx')

# Function to count keywords in a text
def count_keywords(text, keywords):
    count = 0
    words = re.findall(r'\b\w+\b', text.lower())  # Extract words and convert text to lowercase
    keywords = [word.lower() for word in keywords]  # Convert all keywords to lowercase
    
    for word in words:
        if word in keywords:
            count += 1
    
    return count

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data['text']

    individualistic_count = count_keywords(text, individualistic_words)
    communal_count = count_keywords(text, communal_words)
    change_seeking_count = count_keywords(text, change_seeking_words)
    change_averse_count = count_keywords(text, change_averse_words)

    total_individual_communal = individualistic_count + communal_count
    total_change = change_seeking_count + change_averse_count

    if total_individual_communal > 0:
        x = (communal_count - individualistic_count) / total_individual_communal
        percent_individualistic = individualistic_count / total_individual_communal
        percent_communal = communal_count / total_individual_communal
    else:
        x = 0
        percent_individualistic = 0
        percent_communal = 0

    if total_change > 0:
        y = (change_seeking_count - change_averse_count) / total_change
        percent_change_seeking = change_seeking_count / total_change
        percent_change_averse = change_averse_count / total_change
    else:
        y = 0
        percent_change_seeking = 0
        percent_change_averse = 0

    return jsonify({
        'x': x,
        'y': y,
        'percentIndividualistic': percent_individualistic,
        'percentCommunal': percent_communal,
        'percentChangeSeeking': percent_change_seeking,
        'percentChangeAverse': percent_change_averse,
        'countIndividualistic': individualistic_count,
        'countCommunal': communal_count,
        'countChangeSeeking': change_seeking_count,
        'countChangeAverse': change_averse_count
    })

if __name__ == '__main__':
    app.run(debug=True)
