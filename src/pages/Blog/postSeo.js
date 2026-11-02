// 글 상세의 검색엔진용 값(canonical 주소, JSON-LD)을 만드는 순수 함수 모음

const SITE_ORIGIN = 'https://devtaco30.github.io/blog';
const AUTHOR_NAME = '박종혁';

// GitHub Pages는 /posts/68 요청을 /posts/68/ 로 301 이동시킨다.
// canonical·og:url이 이동이 끝난 최종 주소(끝 슬래시)를 가리키도록 사이트 주소를 여기서 한 곳으로 만든다.
// ⚠️ scripts/sitemap.js 의 toSiteUrl 과 규칙이 같아야 한다. (src는 ESM, scripts는 CommonJS라 코드를 공유하지 못한다)
export const getSiteUrl = (path) => {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed ? `${SITE_ORIGIN}/${trimmed}/` : `${SITE_ORIGIN}/`;
};

export const getPostUrl = (id) => getSiteUrl(`posts/${id}`);

// schema.org BlogPosting. published_at은 밀리초 epoch 이다.
export const buildPostJsonLd = (post, description) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    inLanguage: 'ko',
    mainEntityOfPage: getPostUrl(post.id),
    image: `${SITE_ORIGIN}/og-image.png`,
    author: { '@type': 'Person', name: AUTHOR_NAME },
  };

  if (post.published_at) {
    jsonLd.datePublished = new Date(Number(post.published_at)).toISOString();
  }
  if (Array.isArray(post.tags) && post.tags.length > 0) {
    jsonLd.keywords = post.tags.join(', ');
  }

  return jsonLd;
};
