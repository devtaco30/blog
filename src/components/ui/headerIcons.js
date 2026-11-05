import React from 'react';

/**
 * 화면 왼쪽 위 버튼(☰, 사이드바 여닫기)이 함께 쓰는 얇은 선 아이콘과 버튼 모양.
 * 아이콘 모양은 Lucide(https://lucide.dev, ISC 라이선스)의 menu·panel-left를 그대로 옮겼다.
 */

const ICON_SIZE = 18;
const BUTTON_SIZE = 32;

const LineIcon = ({ children }) => (
  <svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export const MenuLineIcon = () => (
  <LineIcon>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </LineIcon>
);

export const PanelLeftIcon = () => (
  <LineIcon>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </LineIcon>
);

// 아이콘 색은 감싼 요소가 CSS 변수로 정한다. ☰ 줄은 스크롤하면 이 값을 연한 회색으로 바꾼다.
export const HEADER_ICON_COLOR_VAR = '--header-icon-color';
export const HEADER_ICON_COLOR = '#4b5563';
export const HEADER_ICON_DIMMED_COLOR = '#b0b5bd';

// 흰 배경(불투명도 90%)을 깐다. 페이지 맨 위에서는 바탕도 흰색이라 배경이 없는 것처럼 보이고,
// 스크롤해서 본문 글자 위에 버튼이 올라가면 글자를 가려 아이콘이 읽힌다.
export const HEADER_ICON_BUTTON_SX = {
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  p: 0,
  borderRadius: '8px',
  color: `var(${HEADER_ICON_COLOR_VAR}, ${HEADER_ICON_COLOR})`,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  transition: 'color 0.3s ease, background-color 0.15s ease',
  '&:hover': { backgroundColor: '#eef0f3', color: '#111827' },
  '&.Mui-focusVisible': { backgroundColor: '#eef0f3', color: '#111827' },
};
