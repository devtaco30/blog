import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BlogPost from './BlogPost';
import PostsShell from './PostsShell';
import {
  getPostById,
  incrementViewCount,
  getAdjacentPosts,
  getRelatedPostsByCategory,
  getPublishedPostTagLists,
} from '../../services/posts';
import { getAllCategories, getPostCountsByAllCategories } from '../../services/categories';

// ESM-only 마크다운 패키지는 Jest가 해석하지 못해 목으로 대체한다 (BlogPost.meta.test.js와 동일).
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => children,
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

const renderPost = async () => {
  getPostById.mockResolvedValue({
    data: {
      id: 1,
      title: '조회수 테스트 글',
      excerpt: ['요약 문장'],
      content: '# 본문',
      tags: [],
      is_published: true,
      published_at: Date.now(),
    },
    error: null,
  });
  incrementViewCount.mockResolvedValue({ data: null, error: null });
  getAdjacentPosts.mockResolvedValue({ prev: null, next: null, error: null });
  getRelatedPostsByCategory.mockResolvedValue({ data: [], error: null });
  getAllCategories.mockResolvedValue({ data: [], error: null });
  getPostCountsByAllCategories.mockResolvedValue({ data: {}, error: null });
  getPublishedPostTagLists.mockResolvedValue({ data: [], error: null });

  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/posts/1']}>
        <Routes>
          <Route element={<PostsShell />}>
            <Route path="/posts/:id" element={<BlogPost />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
  await waitFor(() => expect(document.title).toContain('조회수 테스트 글'));
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test('제외 플래그가 없으면 글을 열 때 조회수를 올린다', async () => {
  await renderPost();
  await waitFor(() => expect(incrementViewCount).toHaveBeenCalledWith('1'));
});

test('excludeFromVisitorCount 플래그가 있으면 조회수를 올리지 않는다 (프리렌더 제외용)', async () => {
  localStorage.setItem('excludeFromVisitorCount', 'true');
  await renderPost();
  // 조회수 증가 effect가 돌 시간을 준 뒤에도 호출되지 않아야 한다
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(incrementViewCount).not.toHaveBeenCalled();
});
