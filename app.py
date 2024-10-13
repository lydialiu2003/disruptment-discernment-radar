from flask import Flask, request, jsonify, render_template
import pandas as pd
import re

app = Flask(__name__)

# Load keywords and weights from a specific Excel file
def load_weighted_keywords(file_path):
    df = pd.read_excel(file_path, header=None, engine='openpyxl')  # Assuming no header
    if df.shape[1] < 2:  # Ensure there are at least two columns
        raise ValueError(f"File {file_path} must have at least two columns: keywords and weights.")
    keywords_with_weights = dict(zip(df[0].str.lower(), df[1]))  # Lowercase for consistency
    return keywords_with_weights

# Load the word lists from individual Excel files
try:
    individualistic_words = load_weighted_keywords('data/individual_keywords.xlsx')
    communal_words = load_weighted_keywords('data/communal_keywords.xlsx')
    change_seeking_words = load_weighted_keywords('data/seeking_words.xlsx')
    change_averse_words = load_weighted_keywords('data/averse_words.xlsx')
except ValueError as e:
    print(e)

# Function to count occurrences and apply weights to keywords in the text
def count_weighted_and_occurrences(text, keywords_with_weights):
    weighted_count = 0
    occurrences_count = 0
    words = re.findall(r'\b\w+\b', text.lower())  # Extract words and convert text to lowercase
    
    for word in words:
        if word in keywords_with_weights:
            occurrences_count += 1  # Count the occurrence
            weighted_count += keywords_with_weights[word]  # Apply weight
    
    return weighted_count, occurrences_count

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data['text']

    # Count occurrences and weights
    individualistic_weighted, individualistic_occurrences = count_weighted_and_occurrences(text, individualistic_words)
    communal_weighted, communal_occurrences = count_weighted_and_occurrences(text, communal_words)
    change_seeking_weighted, change_seeking_occurrences = count_weighted_and_occurrences(text, change_seeking_words)
    change_averse_weighted, change_averse_occurrences = count_weighted_and_occurrences(text, change_averse_words)

    # Calculate percentages based on weights
    total_weighted_individual_communal = individualistic_weighted + communal_weighted
    total_weighted_change = change_seeking_weighted + change_averse_weighted

    if total_weighted_individual_communal > 0:
        x = (communal_weighted - individualistic_weighted) / total_weighted_individual_communal
        percent_individualistic = individualistic_weighted / total_weighted_individual_communal
        percent_communal = communal_weighted / total_weighted_individual_communal
    else:
        x = 0
        percent_individualistic = 0
        percent_communal = 0

    if total_weighted_change > 0:
        y = (change_seeking_weighted - change_averse_weighted) / total_weighted_change
        percent_change_seeking = change_seeking_weighted / total_weighted_change
        percent_change_averse = change_averse_weighted / total_weighted_change
    else:
        y = 0
        percent_change_seeking = 0
        percent_change_averse = 0

    # Return both weighted counts and occurrences for the chart
    return jsonify({
        'x': x,
        'y': y,
        'percentIndividualistic': percent_individualistic,
        'percentCommunal': percent_communal,
        'percentChangeSeeking': percent_change_seeking,
        'percentChangeAverse': percent_change_averse,
        'countIndividualistic': individualistic_occurrences,
        'countCommunal': communal_occurrences,
        'countChangeSeeking': change_seeking_occurrences,
        'countChangeAverse': change_averse_occurrences,
        'weightedIndividualistic': individualistic_weighted,
        'weightedCommunal': communal_weighted,
        'weightedChangeSeeking': change_seeking_weighted,
        'weightedChangeAverse': change_averse_weighted
    })

if __name__ == '__main__':
    app.run(debug=True)
