// 이 폭 이하에서는 사이드바를 본문 옆이 아니라 본문 위에 쌓는다 (폰 화면).
// 맥북 내장화면을 반으로 나눈 창(약 735~756px)은 이보다 넓어서 데스크톱처럼 옆에 둔다.
const MOBILE_MAX_WIDTH = 600;

export const MOBILE_MEDIA_QUERY = `@media (max-width:${MOBILE_MAX_WIDTH}px)`;
