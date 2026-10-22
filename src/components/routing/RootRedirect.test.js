import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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
