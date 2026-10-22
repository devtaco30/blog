import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { slugifyHeading, pickActiveHeadingId, usePostHeadings } from './postToc';

describe('slugifyHeading', () => {
  it('공백은 -로, 한글과 영문 숫자는 남기고 기호는 뺀다', () => {
    expect(slugifyHeading('1. Claude Code란?')).toBe('1-claude-code란');
    expect(slugifyHeading('  Skill / Agent 작성  ')).toBe('skill-agent-작성');
  });

  it('남는 글자가 없으면 section을 돌려준다', () => {
    expect(slugifyHeading('???')).toBe('section');
  });
});

describe('pickActiveHeadingId', () => {
  const items = [
    { id: 'a', top: -300 },
    { id: 'b', top: -20 },
    { id: 'c', top: 400 },
  ];

  it('기준선(offset)을 지나간 마지막 소제목을 고른다', () => {
    expect(pickActiveHeadingId(items, 100)).toBe('b');
  });

  it('아직 아무것도 지나가지 않았으면 첫 소제목이다', () => {
    expect(pickActiveHeadingId([{ id: 'a', top: 300 }, { id: 'b', top: 700 }], 100)).toBe('a');
  });

  it('소제목이 없으면 빈 문자열이다', () => {
    expect(pickActiveHeadingId([], 100)).toBe('');
  });
});

const Harness = ({ html }) => {
  const ref = useRef(null);
  const headings = usePostHeadings(ref, html);
  return (
    <div>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      <ul aria-label="found">
        {headings.map((h) => (
          <li key={h.id}>{`${h.level}:${h.id}:${h.text}`}</li>
        ))}
      </ul>
    </div>
  );
};

describe('usePostHeadings', () => {
  it('h2와 h3를 모아 id를 붙이고 같은 제목에는 번호를 붙여 구분한다', () => {
    render(<Harness html="<h2>작성 전 준비</h2><h3>기본 구조</h3><h3>기본 구조</h3><h4>무시</h4><h1>무시</h1>" />);
    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['2:작성-전-준비:작성 전 준비', '3:기본-구조:기본 구조', '3:기본-구조-2:기본 구조']);
  });

  it('이미 id가 있는 소제목은 그 id를 쓴다', () => {
    render(<Harness html='<h2 id="intro">소개</h2>' />);
    expect(screen.getByRole('listitem')).toHaveTextContent('2:intro:소개');
  });

  it('소제목이 없으면 빈 목록이다', () => {
    render(<Harness html="<p>본문만 있음</p>" />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
