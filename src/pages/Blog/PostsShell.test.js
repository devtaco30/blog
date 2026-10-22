import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import PostsShell, { useSidebarRegistration, useSidebarData } from './PostsShell';
import { getPublishedPostTagLists } from '../../services/posts';
import { getAllCategories, getPostCountsByAllCategories } from '../../services/categories';

jest.mock('../../services/posts', () => ({ getPublishedPostTagLists: jest.fn() }));
jest.mock('../../services/categories', () => ({
  getAllCategories: jest.fn(),
  getPostCountsByAllCategories: jest.fn(),
}));

const PageA = ({ onCategoryClick }) => {
  const navigate = useNavigate();
  useSidebarRegistration({
    selectedCategoryKey: 'ml-dl',
    selectedTags: ['Java'],
    onCategoryClick,
    onTagToggle: () => {},
    onOpenTagModal: () => {},
  });
  return (
    <div>
      <button onClick={() => navigate('/posts/1')}>글 열기</button>
      <button onClick={() => navigate('/posts/2')}>로딩 글 열기</button>
    </div>
  );
};

const PageB = ({ onCategoryClick }) => {
  const { categories } = useSidebarData();
  useSidebarRegistration({
    selectedCategoryKey: 'language-runtime',
    selectedTags: [],
    onCategoryClick,
    onTagToggle: () => {},
    onOpenTagModal: () => {},
  });
  return <div>글 상세 / 영역 {categories.length}개</div>;
};

const PageUnknownCategory = () => {
  useSidebarRegistration({ selectedCategoryKey: null, selectedTags: [], onCategoryClick: () => {}, onTagToggle: () => {}, onOpenTagModal: () => {} });
  return <div>로딩 중인 글</div>;
};

const renderShell = (handlers = {}) =>
  render(
    <MemoryRouter initialEntries={['/posts']}>
      <Routes>
        <Route element={<PostsShell />}>
          <Route path="/posts" element={<PageA onCategoryClick={handlers.a || (() => {})} />} />
          <Route path="/posts/1" element={<PageB onCategoryClick={handlers.b || (() => {})} />} />
          <Route path="/posts/2" element={<PageUnknownCategory />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  jest.resetAllMocks();
  getAllCategories.mockResolvedValue({
    data: [{ key: 'ml-dl', name: '머신러닝·딥러닝' }, { key: 'language-runtime', name: '언어·런타임' }],
    error: null,
  });
  getPostCountsByAllCategories.mockResolvedValue({ data: { all: 3, 'ml-dl': 2, 'language-runtime': 1 }, error: null });
  getPublishedPostTagLists.mockResolvedValue({ data: [['Java'], ['Java', 'Kotlin']], error: null });
});

describe('PostsShell', () => {
  it('목록에서 글로 이동해도 사이드바는 같은 DOM 노드로 남고 데이터를 다시 불러오지 않는다', async () => {
    renderShell();
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    await within(sidebar).findByRole('button', { name: /머신러닝·딥러닝/ });
    sidebar.dataset.mark = 'same-node';
    fireEvent.click(screen.getByRole('button', { name: '글 열기' }));
    expect(await screen.findByText(/글 상세/)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '글 필터' })).toHaveAttribute('data-mark', 'same-node');
    expect(getAllCategories).toHaveBeenCalledTimes(1);
    expect(getPublishedPostTagLists).toHaveBeenCalledTimes(1);
  });

  it('지금 페이지가 등록한 선택 상태(영역, 태그)를 사이드바가 보여 준다', async () => {
    renderShell();
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    await waitFor(() => expect(within(sidebar).getByRole('button', { name: /머신러닝·딥러닝/ })).toHaveAttribute('aria-pressed', 'true'));
    expect(within(sidebar).getByRole('button', { name: /^Java/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('페이지를 옮기면 선택 상태와 클릭 처리도 새 페이지 것으로 바뀐다', async () => {
    const a = jest.fn();
    const b = jest.fn();
    renderShell({ a, b });
    fireEvent.click(await screen.findByRole('button', { name: '글 열기' }));
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    await waitFor(() => expect(within(sidebar).getByRole('button', { name: /언어·런타임/ })).toHaveAttribute('aria-pressed', 'true'));
    expect(within(sidebar).getByRole('button', { name: /^Java/ })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(within(sidebar).getByRole('button', { name: /머신러닝·딥러닝/ }));
    expect(b).toHaveBeenCalledWith('ml-dl');
    expect(a).not.toHaveBeenCalled();
  });

  it('선택 영역을 아직 모르는 페이지(로딩 중)는 이전 영역 선택을 그대로 둔다', async () => {
    renderShell();
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    await waitFor(() => expect(within(sidebar).getByRole('button', { name: /머신러닝·딥러닝/ })).toHaveAttribute('aria-pressed', 'true'));
    fireEvent.click(screen.getByRole('button', { name: '로딩 글 열기' }));
    expect(await screen.findByText('로딩 중인 글')).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: '글 필터' })).getByRole('button', { name: /머신러닝·딥러닝/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
