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

// react-markdown 및 remark/rehype 플러그인 체인은 ESM-only(exports map 전용) 패키지라
// 이 프로젝트의 Jest(react-scripts 5 번들 jest-resolve)가 해석하지 못함.
// 메타 태그 테스트는 실제 마크다운 렌더링을 검증하지 않으므로 가벼운 목으로 대체.
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

test('글 제목이 document.title에 반영된다', async () => {
  // CRA 기본 Jest 설정(resetMocks: true)이 각 테스트 전에 mock 구현을 초기화하므로,
  // jest.mock 팩토리가 아니라 테스트 본문에서 반환값을 지정한다.
  getPostById.mockResolvedValue({
    data: {
      id: 1,
      title: '테스트 글 제목',
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
  await waitFor(() => expect(document.title).toContain('테스트 글 제목'));
});

test('canonical 링크와 og:url이 끝 슬래시 주소를 가리키고 JSON-LD(BlogPosting)가 head에 들어간다', async () => {
  getPostById.mockResolvedValue({
    data: {
      id: 7,
      title: 'SEO 테스트 글',
      excerpt: ['요약 문장'],
      content: '# 본문',
      tags: ['Java'],
      is_published: true,
      published_at: Date.UTC(2026, 9, 22, 3, 0, 0),
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
      <MemoryRouter initialEntries={['/posts/7']}>
        <Routes>
          <Route element={<PostsShell />}>
            <Route path="/posts/:id" element={<BlogPost />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

  const expectedUrl = 'https://devtaco30.github.io/blog/posts/7/';
  await waitFor(() =>
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(expectedUrl)
  );
  expect(document.querySelector('meta[property="og:url"]').getAttribute('content')).toBe(expectedUrl);

  const ldScript = document.querySelector('script[type="application/ld+json"]');
  expect(ldScript).not.toBeNull();
  const ld = JSON.parse(ldScript.textContent);
  expect(ld['@type']).toBe('BlogPosting');
  expect(ld.headline).toBe('SEO 테스트 글');
  expect(ld.mainEntityOfPage).toBe(expectedUrl);
});
