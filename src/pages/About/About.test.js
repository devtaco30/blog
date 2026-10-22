import React from 'react';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import About from './About';

jest.mock('framer-motion', () => {
  const mockReact = require('react');
  return {
    motion: new Proxy({}, { get: (_, tag) => ({ children }) => mockReact.createElement(tag, {}, children) }),
  };
});
jest.mock('./components/WorkExperienceSection', () => () => null);
jest.mock('./components/EducationSection', () => () => null);
jest.mock('./components/TechnicalSkillsSection', () => () => null);
jest.mock('./components/ProjectsSection', () => () => null);
jest.mock('./components/CurrentFocusSection', () => () => null);

describe('About 프로필 사진', () => {
  it('사이드바 프로필과 같은 캐릭터 그림(avatar.jpg)을 쓴다', () => {
    const { container } = render(
      <HelmetProvider>
        <About />
      </HelmetProvider>
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', expect.stringContaining('/images/profile/avatar.jpg'));
  });
});
