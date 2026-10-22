import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard, { getExcerptLines, MAX_CARD_TAGS } from './PostCard';

const basePost = {
  id: 7,
  title: 'EST AI - YOLO : 객체 탐지 실습',
  tags: ['YOLO', 'Object Detection', 'Ultralytics', 'Python', 'CV'],
  excerpt: ['첫 줄 요약입니다.', '둘째 줄 요약입니다.'],
  content: '본문 '.repeat(100),
  published_at: 1775347200000,
  category_key: 'ml-dl',
};

const renderCard = (post = basePost, handlers = {}) =>
  render(
    <PostCard
      post={post}
      categoryName="머신러닝·딥러닝"
      onClick={handlers.onClick || (() => {})}
      onTagClick={handlers.onTagClick || (() => {})}
    />
  );

describe('PostCard', () => {
  it('제목과 날짜와 영역 이름을 보여 주고 영역 알약은 영역 색이다', () => {
    renderCard();
    expect(screen.getByText('EST AI - YOLO : 객체 탐지 실습')).toBeInTheDocument();
    expect(screen.getByText('2026-04-05')).toBeInTheDocument();
    expect(screen.getByText('머신러닝·딥러닝')).toHaveStyle({ color: 'rgb(124, 58, 237)' });
  });

  it('태그가 5개면 앞 3개와 +2를 보여 준다', () => {
    renderCard();
    expect(MAX_CARD_TAGS).toBe(3);
    ['YOLO', 'Object Detection', 'Ultralytics'].forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('태그가 3개면 +N이 없다', () => {
    renderCard({ ...basePost, tags: ['a', 'b', 'c'] });
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('태그가 빈 배열이나 null이어도 영역 알약만 보이고 깨지지 않는다', () => {
    const { unmount } = renderCard({ ...basePost, tags: [] });
    expect(screen.getByText('머신러닝·딥러닝')).toBeInTheDocument();
    unmount();
    renderCard({ ...basePost, tags: null });
    expect(screen.getByText('머신러닝·딥러닝')).toBeInTheDocument();
  });

  it('요약은 줄마다 별도 요소로 보인다', () => {
    renderCard();
    expect(screen.getByText('첫 줄 요약입니다.')).toBeInTheDocument();
    expect(screen.getByText('둘째 줄 요약입니다.')).toBeInTheDocument();
  });

  it('요약이 null, 빈 배열, 공백뿐이면 본문 앞 150자와 ...를 보여 준다', () => {
    [null, [], ['  ', '']].forEach((excerpt) => {
      expect(getExcerptLines({ excerpt, content: 'x'.repeat(200) })).toEqual(['x'.repeat(150) + '...']);
    });
    expect(getExcerptLines({ excerpt: null })).toEqual([]);
  });

  it('태그 클릭은 onTagClick만 부르고 카드 onClick은 부르지 않는다', () => {
    const onClick = jest.fn();
    const onTagClick = jest.fn();
    renderCard(basePost, { onClick, onTagClick });
    fireEvent.click(screen.getByText('YOLO'));
    expect(onTagClick).toHaveBeenCalledWith('YOLO');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('카드 클릭과 Enter는 onClick(post)를 부른다', () => {
    const onClick = jest.fn();
    renderCard(basePost, { onClick });
    const card = screen.getByRole('link');
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledWith(basePost);
  });

  it('영역 이름이 비어 있으면 영역 알약을 그리지 않는다 (영역 목록을 아직 못 불러온 경우)', () => {
    render(<PostCard post={basePost} categoryName="" onClick={() => {}} onTagClick={() => {}} />);
    expect(screen.getByText('YOLO')).toBeInTheDocument();
    expect(screen.queryByTestId('area-pill')).not.toBeInTheDocument();
  });

  it('영역 이름이 있으면 영역 알약이 있다', () => {
    renderCard();
    expect(screen.getByTestId('area-pill')).toHaveTextContent('머신러닝·딥러닝');
  });

  it('태그 알약은 키보드로 닿을 수 있는 버튼이고 Enter가 카드 열기로 번지지 않는다', () => {
    const onClick = jest.fn();
    const onTagClick = jest.fn();
    renderCard(basePost, { onClick, onTagClick });
    const tagButton = screen.getByRole('button', { name: 'YOLO' });
    expect(tagButton).toHaveAttribute('type', 'button');
    fireEvent.keyDown(tagButton, { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(tagButton);
    expect(onTagClick).toHaveBeenCalledWith('YOLO');
  });

  it('기술 태그 알약은 인디고 배경에 흰 글자이고 +N은 연한 인디고이다', () => {
    renderCard();
    expect(screen.getByRole('button', { name: 'YOLO' })).toHaveStyle({
      color: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(79, 70, 229)',
    });
    expect(screen.getByText('+2')).toHaveStyle({ color: 'rgb(79, 70, 229)', backgroundColor: 'rgb(232, 231, 253)' });
  });
});
