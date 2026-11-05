import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import PostsShell, { useSidebarRegistration, useSidebarData } from './PostsShell';
import { getPublishedPostTagLists } from '../../services/posts';
import { getAllCategories, getPostCountsByAllCategories } from '../../services/categories';
import Layout from '../../components/layout/Layout';

jest.mock('../../services/posts', () => ({ getPublishedPostTagLists: jest.fn() }));
jest.mock('../../components/ui/VisitorCounter', () => () => null);
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

describe('PostsShell 사이드바 여닫기', () => {
  const SIDEBAR_OPEN_STORAGE_KEY = 'devtaco.sidebarOpen';

  // 실제 앱처럼 Layout(왼쪽 위 ☰ 줄) 안에 틀을 그린다. 닫힌 상태의 버튼은 그 줄에 들어간다.
  const renderInLayout = () =>
    render(
      <MemoryRouter initialEntries={['/posts']}>
        <Layout>
          <Routes>
            <Route element={<PostsShell />}>
              <Route path="/posts" element={<PageA onCategoryClick={() => {}} />} />
            </Route>
          </Routes>
        </Layout>
      </MemoryRouter>
    );

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('처음에는 사이드바가 열려 있고, 닫기 버튼은 사이드바 안에 있다', async () => {
    renderInLayout();
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    const closeButton = within(sidebar).getByRole('button', { name: '사이드바 닫기' });
    expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('button', { name: '사이드바 열기' })).not.toBeInTheDocument();
  });

  it('닫으면 사이드바가 감춰지고 ☰ 아래에 열기 버튼이 생기며, 열기를 누르면 다시 보인다', async () => {
    renderInLayout();
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    fireEvent.click(within(sidebar).getByRole('button', { name: '사이드바 닫기' }));

    expect(screen.queryByRole('navigation', { name: '글 필터' })).not.toBeInTheDocument();
    const openButton = screen.getByRole('button', { name: '사이드바 열기' });
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    expect(sidebar).not.toContainElement(openButton);
    // 닫기 버튼이 사라지므로 포커스는 열기 버튼으로 옮긴다 (키보드 사용자가 위치를 잃지 않게)
    expect(openButton).toHaveFocus();

    fireEvent.click(openButton);
    const reopened = screen.getByRole('navigation', { name: '글 필터' });
    expect(reopened).toBe(sidebar);
    expect(screen.queryByRole('button', { name: '사이드바 열기' })).not.toBeInTheDocument();
    expect(within(reopened).getByRole('button', { name: '사이드바 닫기' })).toHaveFocus();
  });

  it('닫은 상태를 브라우저 저장소에 남겨서 새로 그려도 닫힌 채로 시작한다', async () => {
    const { unmount } = renderInLayout();
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    fireEvent.click(within(sidebar).getByRole('button', { name: '사이드바 닫기' }));
    expect(window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY)).toBe('false');
    unmount();

    renderInLayout();
    expect(await screen.findByRole('button', { name: '사이드바 열기' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '글 필터' })).not.toBeInTheDocument();
  });

  it('저장소를 쓸 수 없는 환경(사생활 보호 창 등)이면 열린 상태로 시작하고 여닫기도 된다', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    renderInLayout();
    const sidebar = await screen.findByRole('navigation', { name: '글 필터' });
    fireEvent.click(within(sidebar).getByRole('button', { name: '사이드바 닫기' }));
    expect(screen.getByRole('button', { name: '사이드바 열기' })).toBeInTheDocument();
  });
});
