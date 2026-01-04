# Walkthrough - Project Upload & Setup

I have successfully uploaded the entire application (Frontend + Backend) to the GitHub repository `AXELONGO/APP`. The project is now structured as a monorepo with explicit separation of concerns.

## Repository Setup
- **Repo URL**: https://github.com/AXELONGO/APP
- **Branch**: `main`
- **Structure**:
  - `/frontend`: React + Vite application (moved source to `/src`)
  - `/backend`: Node.js + Express + Prisma application
  - `docker-compose.yml`: Orchestration for Frontend, Backend, and Database

## Work Completed
### 1. Frontend Migration
- Refactored frontend structure to use standard `src/` directory.
- Updated `package.json` configurations and dependency versions.
- Fixed import paths in `index.html` and `vite.config.ts`.
- Uploaded all components, hooks, contexts, and services.

### 2. Backend Upload
- Configured `Dockerfile` for containerized deployment.
- Setup `Prisma` schema with `Client`, `Lead`, `History`, and `Quote` models.
- Implemented Controllers and Routes for:
  - Leads management (Notion integration)
  - Client history tracking
  - Support ticketing
  - AI Lead Generation (Gemini)
- Uploaded core server logic (`server.js`, `app.js`).

### 3. Root Configuration
- Created `docker-compose.yml` with necessary environment variables.
- Added `.gitignore` to exclude sensitive/generated files.
- Added `.env.example` as a template for secrets.

## Deployment Troubleshooting (Hostinger)
If deploying to Hostinger, ensure the following configuration to strictly match the specific structure of this project:

1. **Framework Preset**: select **`Express`** (or `Node.js`). DO NOT select `Angular`.
2. **Build Command**: `npm run build`
   - *Note*: We added a `build` script to `package.json` that creates a `dist` folder to satisfy Hostinger's requirements.
3. **Entry File**: `index.js`
   - *Note*: A root-level `index.js` was created to serve as the main entry point, importing `src/server.js`.
4. **Output Directory**: `dist`

## Verification
- **Git Status**: Clean. Local file moves (deletions of old paths) have been synchronized.
- **Project Structure**: Verified `ls -F` matches expected layout.
- **Docker**: `docker-compose.yml` validates correctly with all services defined.

## Next Steps
To run the project locally or deploy:
1. `cp .env.example .env` and fill in API keys.
2. `docker-compose up --build`
