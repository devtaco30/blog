import { renderHook, waitFor } from '@testing-library/react';
import { useListSidebarData, ALL_CATEGORY } from './useListSidebarData';
import { getPublishedPostTagLists } from '../../services/posts';
import { getAllCategories, getPostCountsByAllCategories } from '../../services/categories';

jest.mock('../../services/posts', () => ({ getPublishedPostTagLists: jest.fn() }));
jest.mock('../../services/categories', () => ({
  getAllCategories: jest.fn(),
  getPostCountsByAllCategories: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  getAllCategories.mockResolvedValue({ data: [{ key: 'ml-dl', name: '머신러닝·딥러닝' }], error: null });
  getPostCountsByAllCategories.mockResolvedValue({ data: { all: 3, 'ml-dl': 2 }, error: null });
  getPublishedPostTagLists.mockResolvedValue({ data: [['Java'], ['Java', 'Kotlin']], error: null });
});

describe('useListSidebarData', () => {
  it('전체를 맨 앞에 둔 영역 목록과 영역별 개수와 태그 개수를 돌려준다', async () => {
    const { result } = renderHook(() => useListSidebarData());
    await waitFor(() => expect(result.current.tagCounts).toHaveLength(2));
    expect(result.current.categories).toEqual([ALL_CATEGORY, { key: 'ml-dl', name: '머신러닝·딥러닝' }]);
    expect(result.current.categoryCounts).toEqual({ all: 3, 'ml-dl': 2 });
    expect(result.current.tagCounts).toEqual([
      { tag: 'Java', count: 2 },
      { tag: 'Kotlin', count: 1 },
    ]);
  });

  it('태그 개수를 못 불러오면 tagCounts는 빈 배열이고 영역은 정상이다', async () => {
    getPublishedPostTagLists.mockResolvedValue({ data: null, error: new Error('실패') });
    const { result } = renderHook(() => useListSidebarData());
    await waitFor(() => expect(result.current.categories).toHaveLength(2));
    expect(result.current.tagCounts).toEqual([]);
  });

  it('영역을 못 불러와도 전체 항목은 남는다', async () => {
    getAllCategories.mockResolvedValue({ data: null, error: new Error('실패') });
    const { result } = renderHook(() => useListSidebarData());
    await waitFor(() => expect(getAllCategories).toHaveBeenCalled());
    expect(result.current.categories).toEqual([ALL_CATEGORY]);
  });
});
