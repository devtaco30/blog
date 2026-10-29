import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import RootRedirect from './RootRedirect';

describe('RootRedirect', () => {
  it('/ 로 들어오면 /posts 로 이동한다', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/posts" element={<div>글 목록 화면</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('글 목록 화면')).toBeInTheDocument();
  });
});

// 로그인 후 돌아오는 주소(/#access_token=...)와 로그인 오류(/?error=...)는 AuthContext가 읽는다.
// 이동하면서 이 둘을 지우면 로그인 상태를 만들 수 없다.
const LocationProbe = () => {
  const { pathname, search, hash } = useLocation();
  return <div data-testid="location">{pathname + search + hash}</div>;
};

const renderAt = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/posts" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );

describe('RootRedirect 로그인 주소 보존', () => {
  it('로그인 토큰이 담긴 해시(#access_token=...)를 지우지 않고 /posts 로 이동한다', () => {
    renderAt('/#access_token=abc&refresh_token=def');
    expect(screen.getByTestId('location')).toHaveTextContent('/posts#access_token=abc&refresh_token=def');
  });

  it('로그인 오류 쿼리(?error=server_error)를 지우지 않고 /posts 로 이동한다', () => {
    renderAt('/?error=server_error');
    expect(screen.getByTestId('location')).toHaveTextContent('/posts?error=server_error');
  });
});
