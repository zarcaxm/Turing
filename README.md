# USCSS TURING
An alien-inspired retro terminal task manager with nested task support and a nostalgic CRT aesthetic. Built as a desktop application using Electron, React, and TypeScript.

<img width="1156" height="731" alt="image" src="https://github.com/user-attachments/assets/aa6db75c-a428-40c6-9952-abf5048fa8f4" />


## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Desktop Framework**: Electron
- **Database**: SQLite (better-sqlite3) via IPC
- **Styling**: Custom CSS with retro terminal effects
- **State Management**: React Hooks

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/zarcaxm/Turing.git
cd Turing
npm install
```

The `postinstall` script will automatically rebuild the native SQLite module for Electron.

## Development

### Run as Electron Application

Start the Electron app in development mode:

```bash
npm run electron:dev
```

This will concurrently run the Vite dev server and launch the Electron window.

### Run Electron Only

If the dev server is already running:

```bash
npm run electron
```

### Rebuild Native Modules

If you encounter issues with `better-sqlite3` after an Electron update:

```bash
npm run rebuild
```

## Building

### Build Web Version

Compile TypeScript and build for production:

```bash
npm run build
```

### Build Electron Application

Create a distributable Electron app:

```bash
npm run electron:build
```

The built application will be in the `release` directory.


## Architecture

The app uses Electron's IPC (Inter-Process Communication) to bridge the React frontend with SQLite:

```
Renderer (React)          Preload (Bridge)         Main (Node.js)
────────────────          ────────────────         ───────────────
useTasks hook  ──►  window.electron.getTasks()  ──►  database.getAllTasks()
     │                                                      │
     ◄──────────────── returns Task[] ──────────────────────┘
```

- **Main process** (`electron/`) runs Node.js with access to SQLite
- **Renderer process** (`src/`) runs the React UI in a browser context
- **Preload script** securely bridges the two via `contextBridge`

The database is stored at `%APPDATA%/turing-task-manager/turing-tasks.db` (Windows).

## Task System

### Scoring

- **Root tasks**: 100 points
- **1st level subtasks**: 90 points
- **2nd level subtasks**: 80 points
- **3rd level subtasks**: 70 points
- And so on (minimum 0 points)

Only incomplete tasks contribute to the total score.

## Theme

The UI is inspired by the computer terminals from the *Alien* franchise, specifically the USCSS Nostromo's systems operated by the Weyland-Yutani Corporation. The retro aesthetic includes:

- Monospace font (Courier New)
- Green phosphor CRT glow
- Scanline effects
- Terminal-style UI elements
- Dark/Light mode toggle

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
