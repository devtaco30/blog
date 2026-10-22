import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostToc from './PostToc';

const headings = [
  { id: 'intro', text: '작성 전 준비', level: 2 },
  { id: 'skill', text: 'Skill 작성', level: 2 },
  { id: 'skill-basic', text: '기본 구조', level: 3 },
];

describe('PostToc', () => {
  it('목차 제목과 소제목 링크를 보여 준다', () => {
    render(<PostToc headings={headings} activeId="" />);
    expect(screen.getByRole('navigation', { name: '목차' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '작성 전 준비' })).toHaveAttribute('href', '#intro');
    expect(screen.getByRole('link', { name: '기본 구조' })).toHaveAttribute('href', '#skill-basic');
  });

  it('지금 읽는 소제목은 aria-current가 true이고 나머지는 아니다', () => {
    render(<PostToc headings={headings} activeId="skill" />);
    expect(screen.getByRole('link', { name: 'Skill 작성' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: '작성 전 준비' })).not.toHaveAttribute('aria-current');
  });

  it('링크를 누르면 그 소제목으로 부드럽게 스크롤하고 기본 이동은 막는다', () => {
    const scrollIntoView = jest.fn();
    const target = document.createElement('h2');
    target.id = 'skill';
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);
    render(<PostToc headings={headings} activeId="" />);
    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Skill 작성' }));
    expect(notPrevented).toBe(false);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    document.body.removeChild(target);
  });

  it('소제목이 없으면 아무것도 그리지 않는다', () => {
    const { container } = render(<PostToc headings={[]} activeId="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
