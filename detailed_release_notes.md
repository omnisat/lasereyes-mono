# Release Notes

## Workflow Updates
Changes have been made in our GitHub actions workflows. 

### Updated: `.github/workflows/release.yml`
- For the `release.yml` workflow, new permission settings have been included. 
- This workflow is triggered on both 'dev' and 'main' branches, and now has additional write permissions to push commits included. 
  - **Additions**: 
    - A permissions block was added
      ```
      permissions:  # Add this block
      contents: write  # Grants write permissions to push commits
      ```
    This addition grants the workflow write access to the repository's contents, enabling it to push commits automatically.