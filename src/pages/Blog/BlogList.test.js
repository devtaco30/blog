import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BlogList from './BlogList';
import {
  getPostsWithPageNumber,
  searchPostsWithPageNumber,
  getPublishedPostTagLists,
} from '../../services/posts';
import { getAllCategories, getPostCountsByAllCategories } from '../../services/categories';

jest.mock('react-helmet-async', () => ({ Helmet: () => null }));
// 자동 mock은 실제 모듈(supabase 클라이언트)을 먼저 불러오므로 팩토리로 직접 만든다.
jest.mock('../../services/posts', () => ({
  getPostsWithPageNumber: jest.fn(),
  searchPostsWithPageNumber: jest.fn(),
  getPublishedPostTagLists: jest.fn(),
}));
jest.mock('../../services/categories', () => ({
  getAllCategories: jest.fn(),
  getPostCountsByAllCategories: jest.fn(),
}));

const posts = [
  {
    id: 1,
    title: '첫 번째 글',
    tags: ['Java', 'Kotlin'],
    excerpt: ['첫 번째 글의 요약 첫 줄', '요약 둘째 줄'],
    content: '본문',
    published_at: 1775347200000,
    category_key: 'language-runtime',
  },
  {
    id: 2,
    title: '두 번째 글',
    tags: [],
    excerpt: [],
    content: '두 번째 글 본문입니다',
    published_at: 1775260800000,
    category_key: 'ml-dl',
  },
];

const renderList = (initialUrl = '/posts') =>
  render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <BlogList />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.resetAllMocks();
  getAllCategories.mockResolvedValue({
    data: [
      { key: 'language-runtime', name: '언어·런타임' },
      { key: 'ml-dl', name: '머신러닝·딥러닝' },
    ],
    error: null,
  });
  getPostCountsByAllCategories.mockResolvedValue({
    data: { all: 2, 'language-runtime': 1, 'ml-dl': 1 },
    error: null,
  });
  getPostsWithPageNumber.mockResolvedValue({ data: posts, count: 2, error: null });
  searchPostsWithPageNumber.mockResolvedValue({ data: posts, count: 2, error: null });
  getPublishedPostTagLists.mockResolvedValue({ data: [['Java', 'Kotlin'], ['Java']], error: null });
});

describe('BlogList 조립', () => {
  it('사이드바(영역, 기술)와 카드(제목, 요약)를 보여 준다', async () => {
    renderList();
    expect(await screen.findByText('첫 번째 글')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '글 필터' })).toBeInTheDocument();
    expect(screen.getByText('첫 번째 글의 요약 첫 줄')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /^Java\s*2$/ })).toBeInTheDocument();
  });

  it('영역을 누르면 그 영역 key로 글을 다시 불러온다', async () => {
    renderList();
    await screen.findByText('첫 번째 글');
    fireEvent.click(screen.getByRole('button', { name: /머신러닝·딥러닝/ }));
    await waitFor(() => expect(getPostsWithPageNumber).toHaveBeenLastCalledWith(1, 10, 'ml-dl'));
  });

  it('태그 개수를 불러오지 못해도 영역 필터와 카드는 나온다', async () => {
    getPublishedPostTagLists.mockResolvedValue({ data: null, error: new Error('실패') });
    renderList();
    expect(await screen.findByText('첫 번째 글')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /머신러닝·딥러닝/ })).toBeInTheDocument();
    expect(screen.queryByText('기술')).not.toBeInTheDocument();
  });

  it('Ctrl+K를 누르면 검색창에 포커스가 간다', async () => {
    renderList();
    await screen.findByText('첫 번째 글');
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByPlaceholderText('게시글 검색...')).toHaveFocus();
  });

  it('?category=general처럼 글이 없는 영역으로 열려도 그 항목이 선택 상태로 남는다', async () => {
    getAllCategories.mockResolvedValue({
      data: [{ key: 'general', name: '일반 포스팅' }, { key: 'ml-dl', name: '머신러닝·딥러닝' }],
      error: null,
    });
    getPostCountsByAllCategories.mockResolvedValue({ data: { all: 2, general: 0, 'ml-dl': 1 }, error: null });
    renderList('/posts?category=general');
    const button = await screen.findByRole('button', { name: /일반 포스팅/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('조건에 맞는 글이 없으면 안내 문구를 보여 준다 (영역과 기술을 함께 골라 0건이 된 경우)', async () => {
    getPostsWithPageNumber.mockResolvedValue({ data: [], count: 0, error: null });
    searchPostsWithPageNumber.mockResolvedValue({ data: [], count: 0, error: null });
    renderList('/posts?category=ml-dl&tags=Python');
    expect(await screen.findByText('조건에 맞는 글이 없습니다.')).toBeInTheDocument();
  });
});
