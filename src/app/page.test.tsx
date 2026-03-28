import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import Home from './page';

beforeEach(() => {
  localStorage.clear();
});

describe('Home 페이지', () => {
  describe('렌더링', () => {
    it('"할 일 목록" 제목을 표시한다', () => {
      render(<Home />);
      expect(screen.getByRole('heading', { name: '할 일 목록' })).toBeInTheDocument();
    });

    it('입력창과 추가 버튼이 있다', () => {
      render(<Home />);
      expect(screen.getByPlaceholderText('새 할 일을 입력하세요...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
    });

    it('초기 상태에서 빈 목록 메시지를 표시한다', () => {
      render(<Home />);
      expect(screen.getByText('할 일이 없습니다. 추가해보세요!')).toBeInTheDocument();
    });

    it('필터 탭 3개(전체/진행 중/완료)가 있다', () => {
      render(<Home />);
      expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '진행 중' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
    });

    it('추가 버튼은 입력이 없을 때 비활성화된다', () => {
      render(<Home />);
      expect(screen.getByRole('button', { name: '추가' })).toBeDisabled();
    });
  });

  describe('할 일 추가', () => {
    it('입력 후 추가 버튼 클릭으로 할 일을 추가한다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      await user.type(screen.getByPlaceholderText('새 할 일을 입력하세요...'), '새 할 일');
      await user.click(screen.getByRole('button', { name: '추가' }));
      expect(screen.getByText('새 할 일')).toBeInTheDocument();
    });

    it('Enter 키로 할 일을 추가한다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      await user.type(screen.getByPlaceholderText('새 할 일을 입력하세요...'), '엔터로 추가{Enter}');
      expect(screen.getByText('엔터로 추가')).toBeInTheDocument();
    });

    it('추가 후 입력창이 초기화된다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      const input = screen.getByPlaceholderText('새 할 일을 입력하세요...');
      await user.type(input, '할 일{Enter}');
      expect(input).toHaveValue('');
    });

    it('공백만 입력하면 추가되지 않는다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      await user.type(screen.getByPlaceholderText('새 할 일을 입력하세요...'), '   {Enter}');
      expect(screen.getByText('할 일이 없습니다. 추가해보세요!')).toBeInTheDocument();
    });

    it('추가 후 추가 버튼이 다시 비활성화된다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      await user.type(screen.getByPlaceholderText('새 할 일을 입력하세요...'), '할 일{Enter}');
      expect(screen.getByRole('button', { name: '추가' })).toBeDisabled();
    });
  });

  describe('할 일 완료 처리', () => {
    it('토글 버튼 클릭으로 완료 처리된다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      await user.type(screen.getByPlaceholderText('새 할 일을 입력하세요...'), '할 일{Enter}');
      await user.click(screen.getByLabelText('완료 처리'));
      expect(screen.getByText('할 일')).toHaveClass('line-through');
    });

    it('완료 처리 후 다시 클릭하면 미완료로 돌아간다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      await user.type(screen.getByPlaceholderText('새 할 일을 입력하세요...'), '할 일{Enter}');
      await user.click(screen.getByLabelText('완료 처리'));
      await user.click(screen.getByLabelText('완료 취소'));
      expect(screen.getByText('할 일')).not.toHaveClass('line-through');
    });
  });

  describe('할 일 삭제', () => {
    it('삭제 버튼 클릭으로 항목이 제거된다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      await user.type(screen.getByPlaceholderText('새 할 일을 입력하세요...'), '삭제할 항목{Enter}');
      await user.click(screen.getByLabelText('삭제'));
      expect(screen.queryByText('삭제할 항목')).not.toBeInTheDocument();
    });
  });

  describe('필터', () => {
    async function setupWithTodos() {
      const user = userEvent.setup();
      render(<Home />);
      const input = screen.getByPlaceholderText('새 할 일을 입력하세요...');
      await user.type(input, '미완료 항목{Enter}');
      await user.type(input, '완료 항목{Enter}');
      // 맨 앞(완료 항목)의 토글 버튼 클릭
      await user.click(screen.getAllByLabelText('완료 처리')[0]);
      return user;
    }

    it('"진행 중" 필터는 미완료 항목만 표시한다', async () => {
      const user = await setupWithTodos();
      await user.click(screen.getByRole('button', { name: '진행 중' }));
      expect(screen.getByText('미완료 항목')).toBeInTheDocument();
      expect(screen.queryByText('완료 항목')).not.toBeInTheDocument();
    });

    it('"완료" 필터는 완료 항목만 표시한다', async () => {
      const user = await setupWithTodos();
      await user.click(screen.getByRole('button', { name: '완료' }));
      expect(screen.getByText('완료 항목')).toBeInTheDocument();
      expect(screen.queryByText('미완료 항목')).not.toBeInTheDocument();
    });

    it('"전체" 필터는 모든 항목을 표시한다', async () => {
      const user = await setupWithTodos();
      await user.click(screen.getByRole('button', { name: '완료' }));
      await user.click(screen.getByRole('button', { name: '전체' }));
      expect(screen.getByText('미완료 항목')).toBeInTheDocument();
      expect(screen.getByText('완료 항목')).toBeInTheDocument();
    });

    it('"완료" 필터에서 완료 항목이 없으면 안내 메시지를 표시한다', async () => {
      render(<Home />);
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: '완료' }));
      expect(screen.getByText('완료한 항목이 없습니다.')).toBeInTheDocument();
    });
  });

  describe('완료 항목 삭제', () => {
    it('"완료 항목 삭제" 클릭 시 완료된 항목만 제거된다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      const input = screen.getByPlaceholderText('새 할 일을 입력하세요...');
      await user.type(input, '남길 항목{Enter}');
      await user.type(input, '삭제될 완료 항목{Enter}');
      await user.click(screen.getAllByLabelText('완료 처리')[0]);
      await user.click(screen.getByRole('button', { name: '완료 항목 삭제' }));
      expect(screen.getByText('남길 항목')).toBeInTheDocument();
      expect(screen.queryByText('삭제될 완료 항목')).not.toBeInTheDocument();
    });
  });

  describe('남은 항목 수', () => {
    it('미완료 항목 수를 표시한다', async () => {
      const user = userEvent.setup();
      render(<Home />);
      const input = screen.getByPlaceholderText('새 할 일을 입력하세요...');
      await user.type(input, 'A{Enter}');
      await user.type(input, 'B{Enter}');
      await user.type(input, 'C{Enter}');
      await user.click(screen.getAllByLabelText('완료 처리')[0]);
      expect(screen.getByText('2개 남음')).toBeInTheDocument();
    });

    it('초기에는 0개 남음을 표시한다', () => {
      render(<Home />);
      expect(screen.getByText('0개 남음')).toBeInTheDocument();
    });
  });
});
