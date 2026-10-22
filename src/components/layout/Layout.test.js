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

  it('GitHub Pages가 붙이는 끝 슬래시(/posts/)가 있어도 컨테이너 없이 그린다', () => {
    renderAt('/posts/');
    expect(screen.queryByTestId('page-container')).not.toBeInTheDocument();
    expect(screen.getByText('본문')).toBeInTheDocument();
  });

  it.each(['/posts/68', '/posts/68/'])('글 상세(%s)도 컨테이너 없이 그린다 (왼쪽 사이드바와 오른쪽 목차를 직접 배치하기 위해)', (path) => {
    renderAt(path);
    expect(screen.queryByTestId('page-container')).not.toBeInTheDocument();
    expect(screen.getByText('본문')).toBeInTheDocument();
  });

  it.each(['/', '/about', '/admin/posts', '/login'])('%s는 지금처럼 폭이 제한된 컨테이너 안에 그린다', (path) => {
    renderAt(path);
    expect(screen.getByTestId('page-container')).toHaveTextContent('본문');
  });
});

describe('Layout 푸터', () => {
  it('블로그 이름을 DevJack 으로 보여 준다', () => {
    renderAt('/about');
    expect(screen.getByText(/DevJack Blog/)).toBeInTheDocument();
  });
});
