# HYPERION
A creative sci-fi inspired task platform designed to make nested planning feel engaging and to encourage users to break work into subtasks. Built as a desktop application using Electron, React, and TypeScript.

<img width="1156" height="731" alt="image" src="https://github.com/user-attachments/assets/aa6db75c-a428-40c6-9952-abf5048fa8f4" />

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Desktop Framework**: Electron
- **Database**: SQLite (`better-sqlite3`) via IPC
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

The `postinstall` script automatically rebuilds the native SQLite module for Electron.

## Development

### Run as Electron Application

Start the Electron app in development mode:

```bash
npm start
```

This runs the Vite dev server and launches Electron against it.

### Run Electron Only

Launch the Electron app against the built `dist` files:

```bash
npm run electron
```

For the full development workflow with hot reload, use `npm start`.

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

The app uses Electron IPC to bridge the React frontend with SQLite:

```text
Renderer (React)       Preload (Bridge)         Main (Node.js)
----------------       ----------------         ---------------
useTasks hook   --->   window.electron.*  --->  database.*
     ^                                                   |
     +---------------------- returns Task[] -------------+
```

- **Main process** (`electron/`) runs Node.js with access to SQLite
- **Renderer process** (`src/`) runs the React UI in a browser context
- **Preload script** securely bridges the two via `contextBridge`

The database is stored at `%APPDATA%/hyperion-task-manager/turing-tasks.db` on Windows.

## Task System

### Scoring

- **Leaf tasks**: base score is `10 - (level * 2)` with a minimum of 3
- **Parent tasks**: display the sum of their direct subtasks so larger task groups still show their rolled-up value
- Completed score displays count completed leaf tasks only, which keeps daily/monthly totals from inflating due to nested task structure

Scores are derived from the current task tree in the renderer.

## Theme

The UI uses a retro sci-fi interface style to make task planning feel more atmospheric and deliberate. The aesthetic includes:

- Monospace font (Courier New)
- Green phosphor CRT glow
- Scanline effects
- Terminal-style UI elements
- Dark/Light mode toggle

## License

MIT

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.
