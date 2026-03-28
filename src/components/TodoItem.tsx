'use client';

import { useState, useRef, useEffect } from 'react';
import { Todo } from '@/types/todo';

interface Props {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.text) onEdit(trimmed);
    else setDraft(todo.text);
    setEditing(false);
  };

  return (
    <li className="group flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.completed
            ? 'bg-emerald-400 border-emerald-400'
            : 'border-gray-300 hover:border-emerald-400'
        }`}
        aria-label={todo.completed ? '완료 취소' : '완료 처리'}
      >
        {todo.completed && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') { setDraft(todo.text); setEditing(false); }
          }}
          className="flex-1 bg-transparent outline-none border-b border-emerald-400 text-gray-800 py-0.5"
        />
      ) : (
        <span
          onDoubleClick={() => { setDraft(todo.text); setEditing(true); }}
          className={`flex-1 text-sm cursor-default select-none ${
            todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
          }`}
        >
          {todo.text}
        </span>
      )}

      <button
        onClick={onDelete}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
        aria-label="삭제"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}
