import { useEffect } from 'react';

/**
 * Ctrl+K / Cmd+K를 누르면 검색창에 포커스를 주고 이미 입력된 검색어를 전체 선택한다.
 * 터미널 내비게이션은 Ctrl/Cmd+M만 쓰므로 겹치지 않는다.
 * @param {React.RefObject<HTMLInputElement>} inputRef
 */
export const useSearchShortcut = (inputRef) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputRef]);
};
