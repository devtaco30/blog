import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BlogListSidebar from './BlogListSidebar';

const categories = [
  { key: 'all', name: '전체' },
  { key: 'ml-dl', name: '머신러닝·딥러닝' },
  { key: 'language-runtime', name: '언어·런타임' },
  { key: 'backend', name: '백엔드' },
];
const categoryCounts = { all: 38, 'ml-dl': 26, 'language-runtime': 12, backend: 0 };
const tagCounts = [
  { tag: 'Java', count: 12 },
  { tag: 'Programming', count: 11 },
  { tag: 'Python', count: 11 },
  { tag: 'Kotlin', count: 6 },
];

const setup = (overrides = {}) => {
  const props = {
    categories,
    categoryCounts,
    selectedCategoryKey: 'all',
    onCategoryClick: jest.fn(),
    tagCounts,
    selectedTags: [],
    onTagToggle: jest.fn(),
    onOpenTagModal: jest.fn(),
    ...overrides,
  };
  render(
    <MemoryRouter>
      <BlogListSidebar {...props} />
    </MemoryRouter>
  );
  return props;
};

describe('BlogListSidebar 영역', () => {
  it('영역 이름과 개수를 보여 주고 클릭하면 onCategoryClick(key)를 부른다', () => {
    const props = setup();
    const button = screen.getByRole('button', { name: /머신러닝·딥러닝/ });
    expect(within(button).getByText('26')).toBeInTheDocument();
    fireEvent.click(button);
    expect(props.onCategoryClick).toHaveBeenCalledWith('ml-dl');
  });

  it('선택된 영역은 aria-pressed가 true이다', () => {
    setup({ selectedCategoryKey: 'ml-dl' });
    expect(screen.getByRole('button', { name: /머신러닝·딥러닝/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^전체\s*38$/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('글이 0편인 영역은 보이지 않는다', () => {
    setup();
    expect(screen.queryByRole('button', { name: /백엔드/ })).not.toBeInTheDocument();
  });

  it('글이 0편이어도 선택된 영역은 보인다 (?category=backend로 열린 경우)', () => {
    setup({ selectedCategoryKey: 'backend' });
    expect(screen.getByRole('button', { name: /백엔드/ })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('BlogListSidebar 기술', () => {
  it('제외 태그(Programming)는 보이지 않고 나머지는 개수와 함께 보인다', () => {
    setup();
    expect(screen.queryByRole('button', { name: /Programming/ })).not.toBeInTheDocument();
    expect(within(screen.getByRole('button', { name: /^Java/ })).getByText('12')).toBeInTheDocument();
  });

  it('태그를 클릭하면 onTagToggle(tag)를 부르고 선택된 태그는 aria-pressed가 true이다', () => {
    const props = setup({ selectedTags: ['Kotlin'] });
    expect(screen.getByRole('button', { name: /^Kotlin/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /^Java/ }));
    expect(props.onTagToggle).toHaveBeenCalledWith('Java');
  });

  it('상위 8개 밖의 태그를 골랐으면 목록 맨 위에 선택 상태로 보인다', () => {
    setup({
      tagCounts: [
        ...Array.from({ length: 8 }, (_, i) => ({ tag: `T${i}`, count: 20 - i })),
        { tag: 'Rare', count: 1 },
      ],
      selectedTags: ['Rare'],
    });
    const techButtons = screen.getAllByRole('button').filter((b) => /^(T\d|Rare)/.test(b.textContent));
    expect(techButtons[0]).toHaveTextContent('Rare');
    expect(techButtons[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('전체 보기를 누르면 onOpenTagModal()을 부른다', () => {
    const props = setup();
    fireEvent.click(screen.getByRole('button', { name: '전체 보기' }));
    expect(props.onOpenTagModal).toHaveBeenCalledTimes(1);
  });

  it('태그 개수를 불러오지 못해 빈 배열이면 기술 묶음은 숨기고 영역 묶음은 그대로 나온다', () => {
    setup({ tagCounts: [] });
    expect(screen.queryByText('기술')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '전체 보기' })).not.toBeInTheDocument();
    expect(screen.getByText('영역')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /머신러닝·딥러닝/ })).toBeInTheDocument();
  });
});

describe('BlogListSidebar 프로필', () => {
  it('맨 위에 프로필 줄을 두어 About 으로 들어갈 수 있다', () => {
    setup();
    const nav = screen.getByRole('navigation', { name: '글 필터' });
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    const profile = within(nav).getByText('DevJack');
    const firstGroup = within(nav).getByText('영역');
    expect(profile.compareDocumentPosition(firstGroup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
