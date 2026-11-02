// sitemap.xml 생성용 순수 함수. generate-posts-list.js 가 쓰고, sitemap.test.js 가 검증한다.

const SITE_ORIGIN = 'https://devtaco30.github.io/blog';

// GitHub Pages는 /posts/68 요청을 /posts/68/ 로 301 이동시킨다.
// 구글이 이동 없이 바로 받을 수 있게 sitemap에는 끝 슬래시 주소를 적는다.
// ⚠️ src/pages/Blog/postSeo.js 의 getSiteUrl 과 규칙이 같아야 한다. (src는 ESM, scripts는 CommonJS라 코드를 공유하지 못한다)
function toSiteUrl(path) {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed ? `${SITE_ORIGIN}/${trimmed}/` : `${SITE_ORIGIN}/`;
}

function buildSitemap(postUrls, currentDate) {
  // 루트(/blog/)는 제목·본문 없이 JS가 /posts 로 보내는 빈 껍데기라 sitemap에 넣지 않는다.
  const fixedUrls = [
    { loc: toSiteUrl('about'), lastmod: currentDate, changefreq: 'monthly', priority: '0.8' },
    { loc: toSiteUrl('posts'), lastmod: currentDate, changefreq: 'weekly', priority: '0.9' },
  ];

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  [...fixedUrls, ...postUrls].forEach((url) => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${url.loc}</loc>\n`;
    sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`;
    sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${url.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';
  return sitemap;
}

module.exports = { toSiteUrl, buildSitemap };
