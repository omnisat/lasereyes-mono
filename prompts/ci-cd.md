# Repository Structure and Purpose

The repository is a **monorepo** managed with **TurboRepo**, containing three key packages:

- **`lasereyes`** (the main package)
- **`lasereyes-core`**
- **`lasereyes-react`**

The repository uses a **CI/CD pipeline** with GitHub Actions, defined in `release.yml`, to automate the release process, handle version bumping, and sync between `dev` and `main` branches.

## Workflow Goals

1. **Branch Management**:
    - **`dev` branch**: Contains the latest **release candidate (RC)** versions. Feature and bugfix commits go here first.
    - **`main` branch**: Contains stable production versions. Merging into `main` promotes the RC versions to stable.

2. **Automated Versioning**:
    - When changes are pushed to `dev`, the workflow bumps the RC versions of relevant packages.
    - When code is merged to `main`, the RC versions are promoted to stable patch releases.
    - The `lasereyes` package gets a version bump if **any** package has changed (this includes `lasereyes-core` and `lasereyes-react`).

3. **Conflict-Free Merging**:
    - We handle merges between `main` and `dev`, ensuring that `dev` remains up to date with the latest changes from `main`.
    - The merging process uses **sequential processing** and **commit stashing** where needed to avoid conflicts during automated bumps.

4. **CI Workflow Triggers**:
    - On **push to `dev`**:
        - The workflow checks for changes in the three packages and bumps their RC versions accordingly.
    - On **push to `main`**:
        - The workflow promotes the RC versions to stable patch versions.
        - The workflow then syncs `main` back into `dev` and bumps the next RC version in `dev`.

---

## Key Workflow Jobs

### 1. `check-package-changes` Job
- This job determines which packages (`lasereyes`, `lasereyes-core`, `lasereyes-react`) were modified by comparing the latest commit to its parent using `git diff`.
- The outputs of this job (`lasereyes_changed`, `lasereyes_core_changed`, and `lasereyes_react_changed`) are used to decide which packages need version bumps.

### 2. `bump-rc-in-dev` Job
- Runs on pushes to the `dev` branch.
- Checks the outputs from `check-package-changes` to determine which packages were changed.
- Sequentially bumps the RC version of each package if changes are detected.
- Commits and pushes the bumped RC versions to the `dev` branch.
- **Note**: The `lasereyes` package gets a bump if **any** of the packages have changed.

### 3. `promote-to-stable-in-main` Job
- Runs on pushes to the `main` branch.
- Promotes the RC versions of changed packages to stable patch versions.
- Commits and pushes the stable versions to `main`.

### 4. `merge-main-into-dev` Job
- After promoting versions to stable in `main`, this job merges the latest changes from `main` back into `dev`.
- The `git merge` process happens sequentially to avoid conflicts. It uses stashing when needed to prevent failures from uncommitted changes.

### 5. `bump-next-rc-in-dev` Job
- After merging `main` into `dev`, this job bumps the next RC version in `dev`.
- Runs sequentially for each package to ensure version bumps happen without conflicts.
- Uses conditional logic to check if changes occurred in the packages before bumping.

---

## Key Details and Challenges Solved

1. **Handling Version Bumping for Multiple Packages**:
    - The `lasereyes` package always gets a bump if any of the sub-packages change. We achieved this using conditional logic that checks for changes in any package.
    - RC version bumping is done sequentially to avoid concurrency issues.

2. **Git Conflict Resolution**:
    - The process ensures that conflicts during merges (especially when syncing `main` into `dev`) are handled gracefully. In case of uncommitted changes, stashing is used to prevent merge failures.
    - There was an earlier issue with concurrency conflicts during the commit and push steps, which was resolved by making these steps sequential.

3. **Output Logging for Debugging**:
    - During the process of debugging, logging steps were added to verify that the correct outputs (`lasereyes_changed`, `lasereyes_core_changed`, `lasereyes_react_changed`) are passed to subsequent jobs.

4. **Commit and Push Process**:
    - The commit process happens after all necessary version bumps are made. Only one commit is made per run to avoid conflicts with concurrent pushes.

---

## Final Workflow Summary

Your CI/CD pipeline automates:
- Checking for changes in packages on pushes to both `dev` and `main`.
- Bumping RC versions for any changed packages in `dev`.
- Promoting RC versions to stable in `main`.
- Merging changes from `main` into `dev` after every stable release.
- Ensuring that version bumping and merging happens sequentially to avoid concurrency issues and conflicts.

