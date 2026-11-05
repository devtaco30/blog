import { useCallback, useState } from 'react';

export const SIDEBAR_OPEN_STORAGE_KEY = 'devtaco.sidebarOpen';

// 저장된 값이 없거나 저장소를 쓸 수 없으면(사생활 보호 창 등) 열린 상태로 시작한다.
const readStoredOpen = () => {
  try {
    return window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY) !== 'false';
  } catch (error) {
    return true;
  }
};

// ⚠️ SIDE EFFECT: 브라우저 저장소(localStorage)에 값을 쓴다
const writeStoredOpen = (isOpen) => {
  try {
    window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, String(isOpen));
  } catch (error) {
    // 저장하지 못해도 이번 화면에서는 여닫기가 동작한다. 새로고침하면 열린 상태로 돌아갈 뿐이다.
    console.warn('사이드바 상태를 저장하지 못했습니다', error);
  }
};

/** 글 목록·상세 왼쪽 사이드바의 열림 여부. 새로고침해도 유지되도록 브라우저 저장소에 남긴다. */
export const useSidebarOpen = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(readStoredOpen);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((previous) => {
      const next = !previous;
      writeStoredOpen(next);
      return next;
    });
  }, []);

  return { isSidebarOpen, toggleSidebar };
};
