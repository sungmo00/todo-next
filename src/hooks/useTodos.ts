'use client';

import { useState, useEffect } from 'react';
import { Todo, FilterType } from '@/types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('todos');
    if (stored) {
      setTodos(JSON.parse(stored));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, loaded]);

  const addTodo = (text: string) => {
    setTodos(prev => [
      { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const editTodo = (id: string, text: string) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, text } : t)));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;

  return {
    todos: filtered,
    filter,
    setFilter,
    activeCount,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
  };
}
