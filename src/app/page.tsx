'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import TodoItem from '@/components/TodoItem';
import { FilterType } from '@/types/todo';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: '전체', value: 'all' },
  { label: '진행 중', value: 'active' },
  { label: '완료', value: 'completed' },
];

export default function Home() {
  const [input, setInput] = useState('');
  const { todos, filter, setFilter, activeCount, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted } = useTodos();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setInput('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8 tracking-tight">
          할 일 목록
        </h1>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="새 할 일을 입력하세요..."
            className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 bg-white shadow-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-40"
            disabled={!input.trim()}
          >
            추가
          </button>
        </form>

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* 필터 탭 */}
          <div className="flex border-b border-gray-100">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'text-indigo-600 border-b-2 border-indigo-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* 목록 */}
          {todos.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              {filter === 'completed' ? '완료한 항목이 없습니다.' : '할 일이 없습니다. 추가해보세요!'}
            </div>
          ) : (
            <ul>
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                  onEdit={text => editTodo(todo.id, text)}
                />
              ))}
            </ul>
          )}

          {/* 푸터 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 text-xs text-gray-400">
            <span>{activeCount}개 남음</span>
            <button
              onClick={clearCompleted}
              className="hover:text-red-400 transition-colors"
            >
              완료 항목 삭제
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          항목을 더블클릭하면 수정할 수 있습니다.
        </p>
      </div>
    </main>
  );
}
