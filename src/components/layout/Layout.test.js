import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

jest.mock('../ui/VisitorCounter', () => () => null);

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Layout>
        <div>본문</div>
      </Layout>
    </MemoryRouter>
  );

describe('Layout 본문 컨테이너', () => {
  it('글 목록(/posts)은 컨테이너 없이 본문을 그대로 그린다 (사이드바를 화면 왼쪽에 붙이기 위해)', () => {
    renderAt('/posts');
    expect(screen.getByText('본문')).toBeInTheDocument();
    expect(screen.queryByTestId('page-container')).not.toBeInTheDocument();
  });

  it.each(['/', '/about', '/posts/68', '/admin/posts'])('%s는 지금처럼 폭이 제한된 컨테이너 안에 그린다', (path) => {
    renderAt(path);
    expect(screen.getByTestId('page-container')).toHaveTextContent('본문');
  });
});
