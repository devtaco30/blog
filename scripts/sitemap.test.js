// 실행: npm run test:scripts  (Node 내장 테스트 러너. CRA Jest는 src/ 아래만 찾는다)
const test = require('node:test');
const assert = require('node:assert/strict');
const { toSiteUrl, buildSitemap } = require('./sitemap');

test('toSiteUrl: 빈 경로는 사이트 루트', () => {
  assert.equal(toSiteUrl(''), 'https://devtaco30.github.io/blog/');
});

test('toSiteUrl: 경로 끝에 슬래시를 붙인다', () => {
  assert.equal(toSiteUrl('about'), 'https://devtaco30.github.io/blog/about/');
  assert.equal(toSiteUrl('posts/68'), 'https://devtaco30.github.io/blog/posts/68/');
});

test('toSiteUrl: 앞뒤 슬래시가 있어도 한 번씩만 둔다', () => {
  assert.equal(toSiteUrl('/posts/'), 'https://devtaco30.github.io/blog/posts/');
});

test('buildSitemap: 고정 페이지 2개(소개·목록)와 글 주소가 모두 끝 슬래시 형태다', () => {
  const xml = buildSitemap(
    [{ loc: toSiteUrl('posts/1'), lastmod: '2026-10-22', changefreq: 'monthly', priority: '0.7' }],
    '2026-11-02'
  );
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // 루트(/blog/)는 JS가 /posts로 보내는 빈 껍데기(제목·본문 없음)라 넣지 않는다.
  assert.deepEqual(locs, [
    'https://devtaco30.github.io/blog/about/',
    'https://devtaco30.github.io/blog/posts/',
    'https://devtaco30.github.io/blog/posts/1/',
  ]);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.endsWith('</urlset>'));
});
