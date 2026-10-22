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

  it('터미널 위쪽 테두리도 같은 인디고이다', () => {
    renderOpen();
    const container = screen.getByText(/devtaco@portfolio/).parentElement.parentElement;
    // jsdom은 단축 속성의 색을 rgb로 바꾸지 않고 적은 그대로 돌려준다.
    expect(getComputedStyle(container).borderTopColor).toBe('#818cf8');
  });
});
