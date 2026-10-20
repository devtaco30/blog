import { getVisibleCategories } from './getVisibleCategories';

const ALL = { key: 'all', name: '전체' };
const BACKEND = { key: 'backend', name: '백엔드' };
const OS = { key: 'operating-system', name: '운영체제' };
const categories = [ALL, BACKEND, OS];

const keysOf = (list) => list.map((c) => c.key);

describe('getVisibleCategories', () => {
  it('글이 0편인 카테고리는 숨기고 전체는 항상 보인다', () => {
    const counts = { all: 5, backend: 0, 'operating-system': 1 };
    expect(keysOf(getVisibleCategories(categories, counts, 'all'))).toEqual(['all', 'operating-system']);
  });

  it('전체의 개수가 0이어도 전체는 보인다', () => {
    const counts = { all: 0, backend: 0, 'operating-system': 0 };
    expect(keysOf(getVisibleCategories(categories, counts, 'all'))).toEqual(['all']);
  });

  it('글이 1편이면 보인다 (경계값)', () => {
    const counts = { all: 1, backend: 1, 'operating-system': 0 };
    expect(keysOf(getVisibleCategories(categories, counts, 'all'))).toEqual(['all', 'backend']);
  });

  it('현재 선택된 카테고리는 0편이어도 보인다', () => {
    const counts = { all: 5, backend: 0, 'operating-system': 1 };
    expect(keysOf(getVisibleCategories(categories, counts, 'backend'))).toEqual(['all', 'backend', 'operating-system']);
  });

  it('개수를 아직 못 불러왔으면(빈 객체) 거르지 않는다', () => {
    expect(keysOf(getVisibleCategories(categories, {}, 'all'))).toEqual(['all', 'backend', 'operating-system']);
  });

  it('개수 조회에 실패해 해당 key가 counts에 없으면 숨기지 않는다', () => {
    const counts = { all: 5, 'operating-system': 1 };
    expect(keysOf(getVisibleCategories(categories, counts, 'all'))).toEqual(['all', 'backend', 'operating-system']);
  });
});
