import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useTerminalNavigation } from './useTerminalNavigation';

const Probe = () => {
  const { terminalOpen } = useTerminalNavigation();
  const location = useLocation();
  return (
    <div>
      <span data-testid="open">{String(terminalOpen)}</span>
      <span data-testid="path">{location.pathname}</span>
    </div>
  );
};

const openTerminal = () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <Probe />
    </MemoryRouter>
  );
  fireEvent.keyDown(document, { key: 'm', metaKey: true });
};

describe('useTerminalNavigation 단축키', () => {
  it('1 은 글 목록(/posts)으로, 2 는 About 으로 이동하고 터미널을 닫는다', () => {
    openTerminal();
    fireEvent.keyDown(document, { key: '1' });
    expect(screen.getByTestId('path')).toHaveTextContent('/posts');
    expect(screen.getByTestId('open')).toHaveTextContent('false');

    fireEvent.keyDown(document, { key: 'm', metaKey: true });
    fireEvent.keyDown(document, { key: '2' });
    expect(screen.getByTestId('path')).toHaveTextContent('/about');
  });

  it('3 은 더 이상 아무 데도 이동하지 않는다', () => {
    openTerminal();
    fireEvent.keyDown(document, { key: '3' });
    expect(screen.getByTestId('path')).toHaveTextContent('/about');
    expect(screen.getByTestId('open')).toHaveTextContent('true');
  });
});
