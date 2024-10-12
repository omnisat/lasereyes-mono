import openai
import os

# Get the OpenAI API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

# Read the detailed release notes from the file
with open('detailed_release_notes.md', 'r') as f:
    detailed_release_notes = f.read()

# Step 2: Summarize the detailed release notes
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a summarizer. Provide a concise summary of the following release notes."},
        {"role": "user", "content": detailed_release_notes}
    ]
)

# Extract the summarized release notes
summarized_release_notes = response['choices'][0]['message']['content'].strip()

# Write the summarized release notes to a file
with open('summary_release_notes.md', 'w') as f:
    f.write(summarized_release_notes)

# Output the summary (for logs)
print(summarized_release_notes)
