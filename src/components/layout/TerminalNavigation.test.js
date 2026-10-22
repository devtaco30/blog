import React from 'react';
import { render, screen } from '@testing-library/react';
import TerminalNavigation from './TerminalNavigation';

const renderOpen = () =>
  render(
    <TerminalNavigation terminalOpen={true} closeTerminal={() => {}} handleNavigationClick={() => {}} />
  );

describe('TerminalNavigation 색', () => {
  it('제목 줄과 묶음 제목이 밝은 인디고(#818cf8)이다', () => {
    renderOpen();
    expect(screen.getByText(/devtaco@portfolio/)).toHaveStyle({ color: 'rgb(129, 140, 248)' });
    expect(screen.getByText('Navigation:')).toHaveStyle({ color: 'rgb(129, 140, 248)' });
    expect(screen.getByText('External:')).toHaveStyle({ color: 'rgb(129, 140, 248)' });
  });
});
