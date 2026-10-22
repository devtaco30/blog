import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import BlogPost from './BlogPost';
import {
  getPostById,
  incrementViewCount,
  getAdjacentPosts,
  getRelatedPostsByCategory,
  getPublishedPostTagLists,
} from '../../services/posts';
import { getAllCategories, getPostCountsByAllCategories } from '../../services/categories';

// 마크다운 라이브러리는 이 Jest가 해석하지 못하므로(BlogPost.meta.test.js 참고) 본문 HTML을 그대로 그리는 목으로 바꾼다.
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => <div dangerouslySetInnerHTML={{ __html: children }} />,
}));
jest.mock('rehype-raw', () => ({ __esModule: true, default: () => {} }));
jest.mock('rehype-katex', () => ({ __esModule: true, default: () => {} }));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => {} }));
jest.mock('remark-math', () => ({ __esModule: true, default: () => {} }));
jest.mock('mermaid', () => ({
  __esModule: true,
  default: { initialize: jest.fn(), render: jest.fn().mockResolvedValue({ svg: '' }) },
}));
jest.mock('../../services/posts', () => ({
  getPostById: jest.fn(),
  incrementViewCount: jest.fn(),
  getAdjacentPosts: jest.fn(),
  getRelatedPostsByCategory: jest.fn(),
  getPublishedPostTagLists: jest.fn(),
}));
jest.mock('../../services/categories', () => ({
  getAllCategories: jest.fn(),
  getPostCountsByAllCategories: jest.fn(),
}));

const post = {
  id: 68,
  title: '직렬화 깊이 파기',
  excerpt: ['요약 첫 줄', '요약 둘째 줄'],
  content: '<h2>작성 전 준비</h2><p>본문입니다</p><h3>기본 구조</h3>',
  tags: ['Java', 'JVM'],
  category_key: 'language-runtime',
  is_published: true,
  published_at: 1775347200000,
};

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

const renderPost = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/posts/68']}>
        <Routes>
          <Route path="/posts/:id" element={<BlogPost />} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

beforeEach(() => {
  getPostById.mockResolvedValue({ data: post, error: null });
  incrementViewCount.mockResolvedValue({ data: null, error: null });
  getAdjacentPosts.mockResolvedValue({ prev: null, next: null, error: null });
  getRelatedPostsByCategory.mockResolvedValue({ data: [], error: null });
  getAllCategories.mockResolvedValue({ data: [{ key: 'language-runtime', name: '언어·런타임' }], error: null });
  getPostCountsByAllCategories.mockResolvedValue({ data: { all: 61, 'language-runtime': 12 }, error: null });
  getPublishedPostTagLists.mockResolvedValue({ data: [['Java'], ['Java', 'JVM']], error: null });
});

describe('BlogPost 레이아웃', () => {
  it('제목을 h1으로, 날짜를 YYYY-MM-DD로 보여 준다', async () => {
    renderPost();
    expect(await screen.findByRole('heading', { level: 1, name: '직렬화 깊이 파기' })).toBeInTheDocument();
    expect(screen.getByText('2026-04-05')).toBeInTheDocument();
  });

  it('경로는 Home / 영역 / 제목이고 앞의 둘은 링크이다', async () => {
    renderPost();
    const crumbs = await screen.findByRole('navigation', { name: '경로' });
    expect(within(crumbs).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    await waitFor(() =>
      expect(within(crumbs).getByRole('link', { name: '언어·런타임' })).toHaveAttribute('href', '/posts?category=language-runtime')
    );
    expect(within(crumbs).getByText('직렬화 깊이 파기')).toBeInTheDocument();
  });

  it('태그는 제목 위에 인디고로 채워져 있고 누르면 그 태그로 목록을 연다', async () => {
    renderPost();
    const tag = await screen.findByRole('link', { name: 'Java' });
    expect(tag).toHaveStyle({ color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(79, 70, 229)' });
    fireEvent.click(tag);
    expect(await screen.findByTestId('location')).toHaveTextContent('/posts?tags=Java');
  });

  it('왼쪽에 영역·기술 사이드바가 있고 현재 글의 영역이 선택되어 있다', async () => {
    renderPost();
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    await waitFor(() =>
      expect(within(sidebar).getByRole('button', { name: /언어·런타임/ })).toHaveAttribute('aria-pressed', 'true')
    );
  });

  it('사이드바에서 영역을 누르면 그 영역의 목록으로 간다', async () => {
    renderPost();
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    fireEvent.click(await within(sidebar).findByRole('button', { name: /언어·런타임/ }));
    expect(await screen.findByTestId('location')).toHaveTextContent('/posts?category=language-runtime');
  });

  it('본문의 h2·h3로 목차를 만든다', async () => {
    renderPost();
    // 목차는 폭 1200px 이상에서만 보이는 CSS(media query)라 jsdom에서는 숨김으로 계산되므로 hidden 옵션을 준다.
    const toc = await screen.findByRole('navigation', { name: '목차', hidden: true });
    expect(within(toc).getByRole('link', { name: '작성 전 준비', hidden: true })).toHaveAttribute('href', '#작성-전-준비');
    expect(within(toc).getByRole('link', { name: '기본 구조', hidden: true })).toBeInTheDocument();
  });

  it('제목 카드에 요약 문장을 따로 보여 주지 않는다 (목록 카드에서 보여 줌)', async () => {
    renderPost();
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByText(/요약 첫 줄/)).not.toBeInTheDocument();
  });
});
