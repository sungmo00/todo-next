import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TodoItem from './TodoItem';
import { Todo } from '@/types/todo';

const baseTodo: Todo = {
  id: '1',
  text: '테스트 할 일',
  completed: false,
  createdAt: 1000,
};

function setup(overrides?: Partial<Todo>, handlers?: {
  onToggle?: () => void;
  onDelete?: () => void;
  onEdit?: (text: string) => void;
}) {
  const todo = { ...baseTodo, ...overrides };
  const onToggle = handlers?.onToggle ?? vi.fn();
  const onDelete = handlers?.onDelete ?? vi.fn();
  const onEdit = handlers?.onEdit ?? vi.fn();
  render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />);
  return { onToggle, onDelete, onEdit };
}

describe('TodoItem', () => {
  describe('렌더링', () => {
    it('할 일 텍스트를 표시한다', () => {
      setup();
      expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
    });

    it('미완료 상태일 때 체크마크가 없다', () => {
      setup({ completed: false });
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      // svg checkmark는 완료 시에만 렌더링되므로 버튼 aria-label로 확인
      expect(screen.getByLabelText('완료 처리')).toBeInTheDocument();
    });

    it('완료 상태일 때 완료 처리된 스타일이 적용된다', () => {
      setup({ completed: true });
      expect(screen.getByLabelText('완료 취소')).toBeInTheDocument();
      expect(screen.getByText('테스트 할 일')).toHaveClass('line-through');
    });

    it('삭제 버튼이 존재한다', () => {
      setup();
      expect(screen.getByLabelText('삭제')).toBeInTheDocument();
    });
  });

  describe('토글', () => {
    it('토글 버튼 클릭 시 onToggle이 호출된다', async () => {
      const user = userEvent.setup();
      const { onToggle } = setup();
      await user.click(screen.getByLabelText('완료 처리'));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('완료 상태에서 토글 버튼 클릭 시 onToggle이 호출된다', async () => {
      const user = userEvent.setup();
      const { onToggle } = setup({ completed: true });
      await user.click(screen.getByLabelText('완료 취소'));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('삭제', () => {
    it('삭제 버튼 클릭 시 onDelete가 호출된다', async () => {
      const user = userEvent.setup();
      const { onDelete } = setup();
      await user.click(screen.getByLabelText('삭제'));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('수정', () => {
    it('텍스트 더블클릭 시 편집 모드로 진입한다', async () => {
      const user = userEvent.setup();
      setup();
      await user.dblClick(screen.getByText('테스트 할 일'));
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('편집 후 Enter 키로 onEdit이 호출된다', async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();
      await user.dblClick(screen.getByText('테스트 할 일'));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '수정된 할 일{Enter}');
      expect(onEdit).toHaveBeenCalledWith('수정된 할 일');
    });

    it('편집 후 blur 시 onEdit이 호출된다', async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();
      await user.dblClick(screen.getByText('테스트 할 일'));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '수정된 내용');
      await user.tab();
      expect(onEdit).toHaveBeenCalledWith('수정된 내용');
    });

    it('Escape 키로 수정을 취소한다', async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();
      await user.dblClick(screen.getByText('테스트 할 일'));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '취소할 내용{Escape}');
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
    });

    it('텍스트가 변경되지 않으면 onEdit을 호출하지 않는다', async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();
      await user.dblClick(screen.getByText('테스트 할 일'));
      await user.keyboard('{Enter}');
      expect(onEdit).not.toHaveBeenCalled();
    });

    it('빈 문자열로 편집하면 onEdit을 호출하지 않는다', async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();
      await user.dblClick(screen.getByText('테스트 할 일'));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.keyboard('{Enter}');
      expect(onEdit).not.toHaveBeenCalled();
    });
  });
});
