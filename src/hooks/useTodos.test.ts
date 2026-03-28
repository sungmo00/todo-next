import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTodos } from './useTodos';

beforeEach(() => {
  localStorage.clear();
});

describe('useTodos', () => {
  describe('초기 상태', () => {
    it('빈 할 일 목록으로 시작한다', () => {
      const { result } = renderHook(() => useTodos());
      expect(result.current.todos).toEqual([]);
    });

    it('기본 필터는 all이다', () => {
      const { result } = renderHook(() => useTodos());
      expect(result.current.filter).toBe('all');
    });

    it('activeCount는 0으로 시작한다', () => {
      const { result } = renderHook(() => useTodos());
      expect(result.current.activeCount).toBe(0);
    });
  });

  describe('localStorage 복원', () => {
    it('저장된 할 일을 불러온다', () => {
      const stored = [
        { id: '1', text: '저장된 할 일', completed: false, createdAt: 1000 },
      ];
      localStorage.setItem('todos', JSON.stringify(stored));

      const { result } = renderHook(() => useTodos());
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('저장된 할 일');
    });
  });

  describe('addTodo', () => {
    it('새 할 일을 추가한다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('새 할 일'); });
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('새 할 일');
    });

    it('추가된 할 일은 completed가 false다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('할 일'); });
      expect(result.current.todos[0].completed).toBe(false);
    });

    it('새 할 일이 목록 맨 앞에 추가된다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('첫 번째'); });
      act(() => { result.current.addTodo('두 번째'); });
      expect(result.current.todos[0].text).toBe('두 번째');
    });

    it('추가 후 localStorage에 저장된다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('저장 테스트'); });
      const stored = JSON.parse(localStorage.getItem('todos')!);
      expect(stored[0].text).toBe('저장 테스트');
    });
  });

  describe('toggleTodo', () => {
    it('미완료 → 완료로 토글된다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('할 일'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.toggleTodo(id); });
      expect(result.current.todos[0].completed).toBe(true);
    });

    it('완료 → 미완료로 토글된다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('할 일'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.toggleTodo(id); });
      act(() => { result.current.toggleTodo(id); });
      expect(result.current.todos[0].completed).toBe(false);
    });

    it('다른 항목에는 영향을 주지 않는다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('A'); });
      act(() => { result.current.addTodo('B'); });
      const idA = result.current.todos[1].id;
      act(() => { result.current.toggleTodo(idA); });
      expect(result.current.todos[0].completed).toBe(false); // B
      expect(result.current.todos[1].completed).toBe(true);  // A
    });
  });

  describe('deleteTodo', () => {
    it('해당 id의 할 일을 삭제한다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('삭제할 항목'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.deleteTodo(id); });
      expect(result.current.todos).toHaveLength(0);
    });

    it('나머지 항목은 유지된다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('A'); });
      act(() => { result.current.addTodo('B'); });
      const idB = result.current.todos[0].id;
      act(() => { result.current.deleteTodo(idB); });
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('A');
    });
  });

  describe('editTodo', () => {
    it('할 일 텍스트를 수정한다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('원본'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.editTodo(id, '수정됨'); });
      expect(result.current.todos[0].text).toBe('수정됨');
    });

    it('completed 상태는 변경되지 않는다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('할 일'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.toggleTodo(id); });
      act(() => { result.current.editTodo(id, '수정됨'); });
      expect(result.current.todos[0].completed).toBe(true);
    });
  });

  describe('clearCompleted', () => {
    it('완료된 항목만 삭제한다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('미완료'); });
      act(() => { result.current.addTodo('완료'); });
      const completedId = result.current.todos[0].id;
      act(() => { result.current.toggleTodo(completedId); });
      act(() => { result.current.clearCompleted(); });
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('미완료');
    });

    it('완료 항목이 없으면 아무것도 삭제되지 않는다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('A'); });
      act(() => { result.current.addTodo('B'); });
      act(() => { result.current.clearCompleted(); });
      expect(result.current.todos).toHaveLength(2);
    });
  });

  describe('filter', () => {
    it('active 필터는 미완료 항목만 반환한다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('미완료'); });
      act(() => { result.current.addTodo('완료'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.toggleTodo(id); });
      act(() => { result.current.setFilter('active'); });
      expect(result.current.todos.every(t => !t.completed)).toBe(true);
    });

    it('completed 필터는 완료 항목만 반환한다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('미완료'); });
      act(() => { result.current.addTodo('완료'); });
      const id = result.current.todos[0].id;
      act(() => { result.current.toggleTodo(id); });
      act(() => { result.current.setFilter('completed'); });
      expect(result.current.todos.every(t => t.completed)).toBe(true);
    });

    it('all 필터는 모든 항목을 반환한다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('A'); });
      act(() => { result.current.addTodo('B'); });
      act(() => { result.current.toggleTodo(result.current.todos[0].id); });
      act(() => { result.current.setFilter('all'); });
      expect(result.current.todos).toHaveLength(2);
    });
  });

  describe('activeCount', () => {
    it('미완료 항목 수를 정확히 반환한다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('A'); });
      act(() => { result.current.addTodo('B'); });
      act(() => { result.current.addTodo('C'); });
      act(() => { result.current.toggleTodo(result.current.todos[0].id); });
      expect(result.current.activeCount).toBe(2);
    });

    it('필터와 무관하게 전체 미완료 수를 반환한다', () => {
      const { result } = renderHook(() => useTodos());
      act(() => { result.current.addTodo('A'); });
      act(() => { result.current.addTodo('B'); });
      act(() => { result.current.toggleTodo(result.current.todos[0].id); });
      act(() => { result.current.setFilter('completed'); });
      expect(result.current.activeCount).toBe(1);
    });
  });
});
