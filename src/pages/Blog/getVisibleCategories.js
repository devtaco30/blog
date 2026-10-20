// 칩 행에 보일 카테고리만 거른다. 글이 0편인 카테고리는 숨긴다.
// - 'all'(전체)은 항상 보인다
// - 현재 선택된 카테고리는 0편이어도 보인다 (?category=... 로 열린 경우 선택 칩이 사라지지 않게)
// - 개수를 아직 못 불러왔거나(counts가 빈 객체) 해당 key의 개수 조회가 실패했으면 거르지 않는다
export const getVisibleCategories = (categories, counts, selectedKey) => {
  const countsLoaded = Object.keys(counts).length > 0;
  if (!countsLoaded) return categories;

  return categories.filter((category) => {
    if (category.key === 'all' || category.key === selectedKey) return true;
    const count = counts[category.key];
    return count === undefined || count > 0;
  });
};
