import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectsSection from './ProjectsSection';
import { projects } from '../../../data/projects';

jest.mock('framer-motion', () => {
  const mockReact = require('react');
  return {
    motion: new Proxy({}, { get: (_, tag) => ({ children, style }) => mockReact.createElement(tag, { style }, children) }),
  };
});

describe('ProjectsSection 카드 배치', () => {
  it('카드를 격자(grid)로 놓아 왼쪽에서 오른쪽, 위에서 아래 순서로 읽힌다', () => {
    render(<ProjectsSection />);
    const firstTitle = screen.getByText(projects[0].title);
    const container = firstTitle.closest('.MuiCard-root').parentElement.parentElement;
    const style = window.getComputedStyle(container);
    expect(style.display).toBe('grid');
    expect(style.columnCount).not.toBe('3');
  });

  it('카드가 data/projects.js 순서 그대로 나온다', () => {
    render(<ProjectsSection />);
    const titles = screen.getAllByRole('heading', { level: 6 }).map((heading) => heading.textContent);
    expect(titles).toEqual(projects.map((project) => project.title));
  });
});
