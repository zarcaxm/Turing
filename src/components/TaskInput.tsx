import React, { useState } from 'react';

interface TaskInputProps {
  onAddTask: (title: string, context?: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showContextInput?: boolean;
}

export function TaskInput({
  onAddTask,
  placeholder = '> NEW TASK_',
  autoFocus = false,
  showContextInput = false
}: TaskInputProps) {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(showContextInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddTask(input, context.trim() || undefined);
      setInput('');
      setContext('');
      setShowContext(showContextInput);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-input-form">
      <div className="task-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="task-input"
          autoFocus={autoFocus}
        />
        {!showContextInput && (
          <button
            type="button"
            className="task-input-context-toggle"
            onClick={() => setShowContext(!showContext)}
            title="Toggle context input"
          >
            {showContext ? '[-]' : '[+]'}
          </button>
        )}
      </div>
      {showContext && (
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="> CONTEXT/DETAILS (OPTIONAL)_"
          className="task-input-context"
          rows={2}
        />
      )}
    </form>
  );
}
