import openai
import os

# Get the OpenAI API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

# Read the git diff content from a file (generated in the GitHub Action)
with open('changes.diff', 'r') as f:
    diff_content = f.read()

# Use OpenAI's GPT to generate detailed release notes based on the git diff
response = openai.Completion.create(
    model="gpt-4",
    prompt=f"Generate detailed release notes based on this git diff: {diff_content}",
    max_tokens=500
)

# Print the generated release notes to stdout
print(response['choices'][0]['text'].strip())
