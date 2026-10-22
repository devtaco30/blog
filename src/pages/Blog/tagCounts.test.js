import { countTags, getSidebarTags, SIDEBAR_TAG_LIMIT, AREA_DUPLICATE_TAGS } from './tagCounts';

describe('countTags', () => {
  it('태그별 글 수를 세고 null 목록과 빈 태그와 한 글 안의 중복은 건너뛴다', () => {
    const lists = [['Java', 'Kotlin'], ['Java'], null, ['Java', 'Java', ''], ['Kotlin']];
    expect(countTags(lists)).toEqual([
      { tag: 'Java', count: 3 },
      { tag: 'Kotlin', count: 2 },
    ]);
  });

  it('개수가 같으면 알파벳 순이다', () => {
    expect(countTags([['b'], ['a'], ['c']]).map((t) => t.tag)).toEqual(['a', 'b', 'c']);
  });
});

describe('getSidebarTags', () => {
  const names = ['Java', 'Python', 'Kotlin', 'JVM', 'Pandas', 'Spring Boot', 'AI', 'NLP', 'Array', 'CLI'];
  const counts = [
    ...AREA_DUPLICATE_TAGS.map((tag, i) => ({ tag, count: 20 - i })),
    ...names.map((tag, i) => ({ tag, count: 10 - i })),
  ].sort((a, b) => b.count - a.count);

  it('영역과 겹치는 태그 4개를 빼고 상위 8개만 보여 준다', () => {
    const result = getSidebarTags(counts, []);
    expect(result).toHaveLength(SIDEBAR_TAG_LIMIT);
    expect(result.map((t) => t.tag)).toEqual(names.slice(0, 8));
    expect(result.every((t) => t.selected === false)).toBe(true);
  });

  it('상위 8개 밖의 태그를 골랐으면 맨 위에 선택된 상태로 추가한다', () => {
    const result = getSidebarTags(counts, ['CLI']);
    expect(result[0]).toEqual({ tag: 'CLI', count: 1, selected: true });
    expect(result.slice(1).map((t) => t.tag)).toEqual(names.slice(0, 8));
  });

  it('상위 8개 안의 태그를 골랐으면 추가하지 않고 그 항목만 선택 상태가 된다', () => {
    const result = getSidebarTags(counts, ['Java']);
    expect(result).toHaveLength(8);
    expect(result.find((t) => t.tag === 'Java').selected).toBe(true);
    expect(result.filter((t) => t.selected)).toHaveLength(1);
  });

  it('제외 목록의 태그를 골랐어도 맨 위에 추가된다', () => {
    const result = getSidebarTags(counts, ['Backend']);
    expect(result[0].tag).toBe('Backend');
    expect(result[0].selected).toBe(true);
    expect(result).toHaveLength(9);
  });

  it('개수 정보에 없는 선택 태그는 개수 0으로 보여 준다', () => {
    expect(getSidebarTags(counts, ['없는태그'])[0]).toEqual({ tag: '없는태그', count: 0, selected: true });
  });
});
