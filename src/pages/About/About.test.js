import React from 'react';
import { render, fireEvent } from '@testing-library/react';
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

describe('About 이력서 다운로드', () => {
  it('사진을 누르면 최신 이력서 PDF 를 내려받는다', () => {
    const clicked = [];
    const spy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      clicked.push({ href: this.getAttribute('href'), download: this.download });
    });
    const { container } = render(
      <HelmetProvider>
        <About />
      </HelmetProvider>
    );
    fireEvent.click(container.querySelector('img'));
    spy.mockRestore();
    expect(clicked).toHaveLength(1);
    expect(clicked[0].href).toContain('/docs/백엔드_개발자_박종혁_이력서.pdf');
    expect(clicked[0].download).toBe('백엔드_개발자_박종혁_이력서.pdf');
  });
});
