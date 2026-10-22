// 글 목록 페이지에서만 쓰는 색 상수. MUI 전역 테마는 건드리지 않는다.

export const ACCENT = { main: '#4f46e5', selectedBg: '#e8e7fd' };

export const TAG_PILL = { color: '#4b5563', bg: '#f1f2f5' };

const FALLBACK_AREA_COLOR = { color: '#6b7280', bg: '#eef0f3' };

// 영역(categories.key) → 알약 색. 목록에 없는 영역(글이 1편뿐인 영역 포함)은 회색으로 묶는다.
const AREA_COLORS = {
  'ml-dl': { color: '#7c3aed', bg: '#f1eafe' },
  'python-data': { color: '#2563eb', bg: '#e6efff' },
  'language-runtime': { color: '#d97706', bg: '#fff1dc' },
  product: { color: '#0f9d8a', bg: '#dff5f1' },
  'dev-tools': { color: '#db2777', bg: '#fde6f0' },
};

export const getAreaColor = (categoryKey) => AREA_COLORS[categoryKey] || FALLBACK_AREA_COLOR;
