import React, { useState } from 'react';

interface TaskInputProps {
  onAddTask: (title: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function TaskInput({ onAddTask, placeholder = '> NEW TASK_', autoFocus = false }: TaskInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddTask(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-input-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="task-input"
        autoFocus={autoFocus}
      />
    </form>
  );
}
