// 글 목록 페이지에서만 쓰는 색 상수. MUI 전역 테마는 건드리지 않는다.

export const ACCENT = { main: '#4f46e5', selectedBg: '#e8e7fd' };

// 기술 태그는 눈에 띄도록 강조색을 꽉 채우고, 숨은 태그 개수(+N)는 한 단계 연하게 둔다.
export const TAG_PILL = { color: '#ffffff', bg: ACCENT.main };
export const TAG_MORE_PILL = { color: ACCENT.main, bg: ACCENT.selectedBg };

const FALLBACK_AREA_COLOR = { color: '#6b7280', bg: '#eef0f3' };

// 영역(categories.key) → 알약 색. 목록에 없는 영역(글이 1편뿐인 영역 포함)은 회색으로 묶는다.
const AREA_COLORS = {
  'ml-dl': { color: '#7c3aed', bg: '#f1eafe' },
  'python-data': { color: '#2563eb', bg: '#e6efff' },
  'language-runtime': { color: '#d97706', bg: '#fff1dc' },
  product: { color: '#0f9d8a', bg: '#dff5f1' },
  'dev-tools': { color: '#db2777', bg: '#fde6f0' },
  'ai-usage': { color: '#16a34a', bg: '#e3f6e8' },
};

export const getAreaColor = (categoryKey) => AREA_COLORS[categoryKey] || FALLBACK_AREA_COLOR;
