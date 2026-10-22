// 사이드바 "기술" 목록용 태그 집계. 개수는 항상 전체 발행 글 기준이다.

export const SIDEBAR_TAG_LIMIT = 8;

// 영역(카테고리)과 같은 뜻이라 사이드바 기술 목록에서 뺀다. 대소문자까지 정확히 같은 값만 뺀다.
export const AREA_DUPLICATE_TAGS = ['Programming', 'Backend', 'Machine Learning', 'Deep Learning'];

/**
 * 글마다의 태그 목록에서 태그별 글 수를 센다.
 * @param {Array<string[] | null>} tagLists
 * @returns {Array<{tag: string, count: number}>} 개수 내림차순, 같으면 태그 이름 순
 */
export const countTags = (tagLists) => {
  const counts = new Map();
  tagLists.forEach((tags) => {
    if (!Array.isArray(tags)) return;
    new Set(tags.filter((tag) => tag)).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
  );
};

/**
 * 사이드바에 보일 태그를 고른다.
 * 제외 태그를 뺀 상위 limit개가 기본이고, 그 밖에서 선택된 태그는 맨 위에 선택 상태로 추가한다.
 * @returns {Array<{tag: string, count: number, selected: boolean}>}
 */
export const getSidebarTags = (tagCounts, selectedTags, limit = SIDEBAR_TAG_LIMIT) => {
  const top = tagCounts.filter(({ tag }) => !AREA_DUPLICATE_TAGS.includes(tag)).slice(0, limit);
  const topNames = new Set(top.map(({ tag }) => tag));

  const extras = selectedTags
    .filter((tag) => !topNames.has(tag))
    .map((tag) => ({
      tag,
      count: (tagCounts.find((entry) => entry.tag === tag) || { count: 0 }).count,
      selected: true,
    }));

  return [
    ...extras,
    ...top.map((entry) => ({ ...entry, selected: selectedTags.includes(entry.tag) })),
  ];
};
