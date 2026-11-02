// 실행: npm run test:scripts
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildLlmsTxt } = require('./llms');

const posts = [
  { id: 68, title: '[Java Deep Dive] Serializable 깊이 파기', excerpt: ['직렬화된 바이트를 읽는 순서', '둘째 줄'] },
  { id: 5, title: '요약 없는 글', excerpt: [] },
];

test('첫 줄은 사이트 이름 H1이고 그 아래에 한 줄 소개(인용문)가 있다', () => {
  const lines = buildLlmsTxt(posts).split('\n');
  assert.equal(lines[0], '# DevJack Blog');
  assert.equal(lines[2].startsWith('> '), true);
});

test('페이지 섹션에 소개와 글 목록 주소(끝 슬래시)가 있다', () => {
  const txt = buildLlmsTxt(posts);
  assert.ok(txt.includes('- [소개](https://devtaco30.github.io/blog/about/)'));
  assert.ok(txt.includes('- [게시글 목록](https://devtaco30.github.io/blog/posts/)'));
});

test('글 섹션에 글마다 제목 링크와 요약 첫 줄이 있다', () => {
  const txt = buildLlmsTxt(posts);
  assert.ok(
    txt.includes(
      '- [[Java Deep Dive] Serializable 깊이 파기](https://devtaco30.github.io/blog/posts/68/): 직렬화된 바이트를 읽는 순서'
    )
  );
});

test('요약이 없는 글은 콜론 없이 링크만 적는다', () => {
  const txt = buildLlmsTxt(posts);
  assert.ok(txt.includes('- [요약 없는 글](https://devtaco30.github.io/blog/posts/5/)\n') || txt.endsWith('- [요약 없는 글](https://devtaco30.github.io/blog/posts/5/)'));
  assert.equal(txt.includes('요약 없는 글](https://devtaco30.github.io/blog/posts/5/):'), false);
});

test('글이 없어도 오류 없이 페이지 섹션까지만 만든다', () => {
  const txt = buildLlmsTxt([]);
  assert.ok(txt.includes('## 페이지'));
});
