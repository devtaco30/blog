import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSearchShortcut } from './useSearchShortcut';

const Harness = () => {
  const inputRef = useRef(null);
  useSearchShortcut(inputRef);
  return <input ref={inputRef} defaultValue="spring boot" aria-label="검색" />;
};

describe('useSearchShortcut', () => {
  it('Ctrl+K를 누르면 검색창에 포커스가 가고 입력된 값이 전체 선택된다', () => {
    render(<Harness />);
    const input = screen.getByLabelText('검색');
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe('spring boot'.length);
  });

  it('Cmd+K도 같다', () => {
    render(<Harness />);
    fireEvent.keyDown(window, { key: 'K', metaKey: true });
    expect(document.activeElement).toBe(screen.getByLabelText('검색'));
  });

  it('Ctrl+K의 기본 동작은 막는다', () => {
    render(<Harness />);
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('K 단독이나 Ctrl+M에서는 포커스를 옮기지 않는다', () => {
    render(<Harness />);
    fireEvent.keyDown(window, { key: 'k' });
    fireEvent.keyDown(window, { key: 'm', ctrlKey: true });
    expect(document.activeElement).not.toBe(screen.getByLabelText('검색'));
  });

  it('언마운트한 뒤에는 동작하지 않는다', () => {
    const { unmount } = render(<Harness />);
    unmount();
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
