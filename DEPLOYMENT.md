# GitHub Pages Deployment Guide

This document explains how to deploy the CraveRate application to GitHub Pages.

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to a GitHub repository
2. **API Key**: You'll need to configure your Gemini API key in GitHub Secrets

## Setup Steps

### 1. Configure Repository Settings

Go to your repository on GitHub and enable GitHub Pages:

1. Navigate to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**

### 2. Add GitHub Secrets

The application requires the Gemini API key to function. Add it as a repository secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GEMINI_API_KEY`
4. Value: Your actual Gemini API key
5. Click **Add secret**

### 3. Configure Base Path (Optional)

The Vite configuration uses an environment variable for the base path:

- **For GitHub Pages subdirectory** (e.g., `https://username.github.io/repo-name/`):
  - The base path defaults to `/` which works for local development
  - When deploying, GitHub Actions will handle the correct path automatically
  - If you need to manually set it, create a `.env.production` file with:
    ```
    VITE_BASE_PATH=/your-repo-name/
    ```

- **For custom domain or root deployment**:
  - No changes needed, keep `VITE_BASE_PATH=/`

### 4. Deploy

#### Automatic Deployment

The GitHub Actions workflow is configured to deploy automatically:

- **On every push to `main` branch**: Workflow triggers automatically
- **Manual trigger**: Go to **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

#### Manual Deployment (Alternative)

If you prefer to deploy manually from your local machine:

```bash
# Install dependencies
npm install

# Build and deploy
npm run deploy
```

Note: Manual deployment requires the `gh-pages` branch to be set up and proper Git credentials.

## Accessing Your Deployed App

After successful deployment, your app will be available at:

```
https://[your-username].github.io/[repository-name]/
```

The exact URL will be shown in the GitHub Actions workflow output and in your repository's Pages settings.

## Troubleshooting

### 404 Errors on Assets

- **Check base path**: Ensure `VITE_BASE_PATH` matches your repository structure
- **Verify build output**: Check that `dist` folder contains `.nojekyll` file
- **Review workflow logs**: Look for build errors in the Actions tab

### API Key Issues

- **Verify secret name**: Must be exactly `GEMINI_API_KEY`
- **Check secret value**: Ensure no extra spaces or quotes
- **Review build logs**: Check if environment variable is being set correctly

### Workflow Fails

- **Node modules**: Clear cache in Actions settings if dependencies fail
- **Permissions**: Ensure workflow has proper permissions (already configured)
- **Branch protection**: Check if `main` branch has restrictions

### SPA Routing Issues

The `404.html` file handles client-side routing. If you add a router library later:
- The fallback mechanism is already in place
- Test direct navigation to routes after deployment
- Check browser console for routing errors

## Files Added for Deployment

- **`.github/workflows/deploy.yml`**: Automated deployment workflow
- **`public/.nojekyll`**: Disables Jekyll processing on GitHub Pages
- **`public/404.html`**: Fallback for SPA routing support
- **`vite.config.ts`**: Updated with base path configuration
- **`package.json`**: Added deploy script and gh-pages dependency

## Updating the Deployed App

Deploy updates by simply pushing to the `main` branch:

```bash
git add .
git commit -m "Update application"
git push origin main
```

The GitHub Actions workflow will automatically rebuild and redeploy your app.
