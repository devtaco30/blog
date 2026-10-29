import React from 'react';
import { render } from '@testing-library/react';
import CurrentFocusSection from './CurrentFocusSection';

jest.mock('framer-motion', () => {
  const mockReact = require('react');
  return {
    motion: new Proxy({}, { get: (_, tag) => ({ children }) => mockReact.createElement(tag, {}, children) }),
  };
});

describe('CurrentFocusSection', () => {
  it('블록체인/Web3 대신 AI 에이전트 항목이 있다', () => {
    const { container } = render(<CurrentFocusSection />);
    expect(container.textContent).not.toContain('블록체인');
    expect(container.textContent).toContain('LLM 기반 AI 에이전트 개발');
  });
});
