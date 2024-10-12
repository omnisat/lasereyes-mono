import openai
import os

# Get the OpenAI API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

# Read the aggregated release notes from a file
with open('release_notes_aggregated.txt', 'r') as f:
    release_notes = f.read()

# Use OpenAI's GPT to summarize the release notes
response = openai.Completion.create(
    model="gpt-4",
    prompt=f"Summarize these release notes: {release_notes}",
    max_tokens=500
)

# Print the summarized release notes to stdout
print(response['choices'][0]['text'].strip())
