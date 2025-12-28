# Local Testing with `act`

To test GitHub Actions workflows locally without pushing to GitHub, you can use a tool called `act`. It runs your workflows in Docker containers.

## Prerequisites

- **Docker**: Must be installed and running.
- **Homebrew**: To install `act`.

## Installation

```bash
brew install act
```

## Running Workflows

### 1. Dry Run (List Actions)
To see which workflows would run:
```bash
act -l
```

### 2. Run a Specific Workflow
To run the `backend-publish.yml` workflow:
```bash
act -W .github/workflows/backend-publish.yml
```

### 3. Handling Secrets
Since your workflows use secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`), you need to provide them to `act`.

**Option A: Interactive Input**
`act` will prompt you for secrets if they are missing, but this can be tedious.

**Option B: Secrets File (Recommended)**
1. Create a file named `.secrets` (add this to `.gitignore`!).
2. Add your secrets:
   ```env
   DOCKER_USERNAME=your-username
   DOCKER_PASSWORD=your-password-or-token
   ```
3. Run `act` with the secrets file:
   ```bash
   act -W .github/workflows/backend-publish.yml --secret-file .secrets
   ```

### 4. Simulating Events
To simulate a `push` to `main`:
```bash
act push
```

To simulate a `workflow_dispatch` (manual trigger):
```bash
act workflow_dispatch -W .github/workflows/backend-publish.yml --secret-file .secrets
```

## Troubleshooting
- **Docker Socket**: If you get errors about the Docker socket, ensure Docker Desktop is running.
- **Architecture**: If you are on an M1/M2/M3 Mac, you might need to specify the architecture if the default image fails:
  ```bash
  act --container-architecture linux/amd64
  ```
