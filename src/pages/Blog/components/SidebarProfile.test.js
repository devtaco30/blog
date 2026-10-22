import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SidebarProfile from './SidebarProfile';

const setup = () =>
  render(
    <MemoryRouter>
      <SidebarProfile />
    </MemoryRouter>
  );

describe('SidebarProfile', () => {
  it('이름을 보여 주고 About 링크는 /about 으로 이동한다', () => {
    setup();
    expect(screen.getByText('DevJack')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('GitHub, 이메일, LinkedIn 링크를 가진다', () => {
    setup();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/devtaco30');
    expect(screen.getByRole('link', { name: '이메일' })).toHaveAttribute('href', 'mailto:devtaco@naver.com');
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/jonghyuk-park-02b1a1203'
    );
  });

  it('프로필 사진에 대체 텍스트가 있다', () => {
    setup();
    expect(screen.getByAltText('DevJack 프로필')).toHaveAttribute('src', expect.stringContaining('avatar-sm.jpg'));
  });
});
