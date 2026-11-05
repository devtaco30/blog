import { createContext, useContext } from 'react';

/**
 * 화면 왼쪽 위 ☰ 버튼 바로 아래에 비워 둔 자리(DOM 노드).
 * Layout이 만들고, 그 아래 페이지가 React 포털(createPortal)로 버튼을 넣는다.
 * 아직 그려지기 전이거나 Layout 밖이면 null이다.
 */
export const HeaderSlotContext = createContext(null);

export const useHeaderSlot = () => useContext(HeaderSlotContext);
