# Deployment Guide

This project uses GitHub Actions to automatically build and release the Turing Task Manager desktop application.

## Prerequisites

1. Push your code to a GitHub repository
2. Update the `repository.url` in [package.json](package.json) with your actual GitHub repository URL

## How to Create a Release

### Step 1: Update Version Number
Edit [package.json](package.json) and update the version:
```json
"version": "1.0.1"
```

### Step 2: Commit Your Changes
```bash
git add .
git commit -m "Release v1.0.1"
```

### Step 3: Create and Push a Tag
```bash
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

### Step 4: Wait for Build
- GitHub Actions will automatically:
  - Build the app for Windows, macOS, and Linux
  - Create a GitHub Release
  - Upload installers to the release

### Step 5: Check Your Release
- Go to your GitHub repository
- Click "Releases" in the sidebar
- Your new release will appear with downloadable installers

## What Gets Built

- **Windows**: `.exe` installer (NSIS)
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` portable executable

## Troubleshooting

### Build Fails on macOS/Linux
If you only need Windows builds, edit [.github/workflows/release.yml](.github/workflows/release.yml) and change:
```yaml
matrix:
  os: [windows-latest]  # Remove macos-latest and ubuntu-latest
```

### GitHub Token Issues
The workflow uses `GITHUB_TOKEN` which is automatically provided by GitHub Actions. No additional setup needed.

## Manual Build (Local Development)

To build locally without releasing:
```bash
npm run electron:build
```

Built files will be in the `release` folder.
