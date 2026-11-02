import { getSiteUrl, getPostUrl, buildPostJsonLd } from './postSeo';

describe('getSiteUrl', () => {
  test('빈 경로는 사이트 루트(/blog/)를 가리킨다', () => {
    expect(getSiteUrl('')).toBe('https://devtaco30.github.io/blog/');
  });

  test('경로 끝에 슬래시를 붙인다', () => {
    expect(getSiteUrl('about')).toBe('https://devtaco30.github.io/blog/about/');
    expect(getSiteUrl('posts')).toBe('https://devtaco30.github.io/blog/posts/');
  });

  test('앞뒤 슬래시가 이미 있어도 한 번씩만 둔다', () => {
    expect(getSiteUrl('/posts/')).toBe('https://devtaco30.github.io/blog/posts/');
  });
});

describe('getPostUrl', () => {
  test('GitHub Pages가 실제로 보내 주는 끝 슬래시 주소를 만든다', () => {
    expect(getPostUrl(68)).toBe('https://devtaco30.github.io/blog/posts/68/');
  });

  test('문자열 id도 같은 주소를 만든다', () => {
    expect(getPostUrl('68')).toBe('https://devtaco30.github.io/blog/posts/68/');
  });
});

describe('buildPostJsonLd', () => {
  const post = {
    id: 68,
    title: '[Java Deep Dive] Serializable 깊이 파기',
    tags: ['Java', 'Serializable'],
    published_at: Date.UTC(2026, 9, 22, 3, 0, 0),
  };

  test('BlogPosting 필수 필드를 채운다', () => {
    const ld = buildPostJsonLd(post, '요약 문장');
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('BlogPosting');
    expect(ld.headline).toBe(post.title);
    expect(ld.description).toBe('요약 문장');
    expect(ld.inLanguage).toBe('ko');
    expect(ld.mainEntityOfPage).toBe('https://devtaco30.github.io/blog/posts/68/');
    expect(ld.author).toEqual({ '@type': 'Person', name: '박종혁' });
  });

  test('published_at(밀리초)을 ISO 8601 문자열로 바꾼다', () => {
    expect(buildPostJsonLd(post, '').datePublished).toBe('2026-10-22T03:00:00.000Z');
  });

  test('태그를 쉼표로 이은 keywords로 넣는다', () => {
    expect(buildPostJsonLd(post, '').keywords).toBe('Java, Serializable');
  });

  test('published_at이 없으면 datePublished를 빼고, 태그가 없으면 keywords를 뺀다', () => {
    const ld = buildPostJsonLd({ id: 1, title: '제목', tags: [] }, '');
    expect(ld).not.toHaveProperty('datePublished');
    expect(ld).not.toHaveProperty('keywords');
  });
});
