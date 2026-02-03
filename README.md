# USCSS TURING 
An alien-inspired retro terminal task manager with nested task support and a nostalgic CRT aesthetic. Built as a desktop application using Electron, React, and TypeScript.

<img width="1570" height="1130" alt="image" src="https://github.com/user-attachments/assets/9d0f612c-6b37-448f-9292-6941ce2a0b11" />

## Features

- **Nested Task Management**: Create unlimited hierarchical subtasks with automatic score calculation
- **Retro Terminal UI**: Weyland-Yutani Corporation-themed interface with authentic CRT screen effects
- **Score System**: Dynamic scoring based on task depth (100 points base, -10 per nesting level)
- **Local Persistence**: Tasks automatically saved to localStorage
- **Expand/Collapse**: Toggle visibility of nested subtasks for better organization
- **Desktop Application**: Runs as a native application via Electron

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Desktop Framework**: Electron
- **Styling**: Custom CSS with retro terminal effects
- **State Management**: React Hooks

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd Turing
npm install
```

## Development

### Run as Web Application

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

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

## Building

### Build Web Version

Compile TypeScript and build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Build Electron Application

Create a distributable Electron app:

```bash
npm run electron:build
```

The built application will be in the `release` directory.

## Project Structure

```
Turing/
├── src/
│   ├── components/
│   │   ├── TaskInput.tsx      # Input component for new tasks
│   │   ├── TaskList.tsx       # List container for tasks
│   │   └── TaskItem.tsx       # Individual task component with subtasks
│   ├── hooks/
│   │   └── useTasks.ts        # Custom hook for task management logic
│   ├── styles/
│   │   ├── terminal.css       # Retro terminal styling
│   │   └── crt-effects.css    # CRT screen effects
│   ├── types/
│   │   └── task.ts            # TypeScript interfaces
│   ├── utils/
│   │   ├── scoring.ts         # Score calculation utilities
│   │   └── storage.ts         # localStorage utilities
│   ├── App.tsx                # Main application component
│   └── index.tsx              # Application entry point
├── electron/                  # Electron main process files
├── public/                    # Static assets
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies and scripts
```

## Task System

### Task Properties

Each task contains:
- **id**: Unique identifier
- **title**: Task description
- **completed**: Completion status
- **level**: Nesting depth (0 = root level)
- **score**: Auto-calculated based on level (100 - level × 10)
- **subtasks**: Array of child tasks
- **createdAt**: Timestamp
- **expanded**: UI state for expand/collapse

### Scoring

- **Root tasks**: 100 points
- **1st level subtasks**: 90 points
- **2nd level subtasks**: 80 points
- **3rd level subtasks**: 70 points
- And so on (minimum 0 points)

Only incomplete tasks contribute to the total score.

## Usage

1. **Add Root Task**: Type in the main input field and press Enter
2. **Add Subtask**: Click the "+ sub" button on any task
3. **Complete Task**: Click the checkbox next to the task title
4. **Delete Task**: Click the "×" button (deletes task and all subtasks)
5. **Expand/Collapse**: Click the ">" arrow to show/hide subtasks

## Keyboard Shortcuts

- `Enter`: Submit new task
- `Escape`: Clear input field (when focused)

## Theme

The UI is inspired by the computer terminals from the *Alien* franchise, specifically the USCSS Nostromo's systems operated by the Weyland-Yutani Corporation. The retro aesthetic includes:

- Monospace font (Courier New)
- Green phosphor CRT glow
- Scanline effects
- Terminal-style UI elements
- Classic command-line appearance

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
