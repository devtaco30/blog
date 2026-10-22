import React from 'react';
import { render, screen } from '@testing-library/react';
import TechnicalSkillsSection from './TechnicalSkillsSection';

jest.mock('framer-motion', () => {
  const mockReact = require('react');
  return {
    motion: new Proxy({}, { get: (_, tag) => ({ children }) => mockReact.createElement(tag, {}, children) }),
  };
});

describe('TechnicalSkillsSection AI 도구', () => {
  it('AI Tools 묶음에 Claude Code 와 Cursor 카드를 아이콘과 함께 보여 준다', () => {
    render(<TechnicalSkillsSection />);
    expect(screen.getByText('AI Tools')).toBeInTheDocument();
    expect(screen.getByAltText('Claude Code')).toHaveAttribute('src', expect.stringContaining('/images/icons/claude.svg'));
    expect(screen.getByAltText('Cursor')).toHaveAttribute('src', expect.stringContaining('/images/icons/cursor.svg'));
  });
});
