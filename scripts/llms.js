// llms.txt 생성용 순수 함수. generate-posts-list.js 가 쓰고, llms.test.js 가 검증한다.
// llms.txt 는 AI가 사이트 구조를 읽도록 사이트 소개와 주요 페이지 링크를 마크다운으로 적어 두는 파일이다 (llmstxt.org 제안 형식).
const { toSiteUrl } = require('./sitemap');

function buildLlmsTxt(posts) {
  const lines = [
    '# DevJack Blog',
    '',
    '> Java · Kotlin 백엔드 개발자 박종혁(DevJack)의 개인 기술 블로그. 백엔드 개발 경험과 학습 기록을 공유합니다.',
    '',
    '## 페이지',
    '',
    `- [소개](${toSiteUrl('about')}): 경력, 기술 스택, 프로젝트`,
    `- [게시글 목록](${toSiteUrl('posts')}): 전체 글 목록`,
  ];

  if (posts.length > 0) {
    lines.push('', '## 글', '');
    posts.forEach((post) => {
      const link = `- [${post.title}](${toSiteUrl(`posts/${post.id}`)})`;
      const summary = Array.isArray(post.excerpt) ? post.excerpt[0] : '';
      lines.push(summary ? `${link}: ${summary}` : link);
    });
  }

  return `${lines.join('\n')}\n`;
}

module.exports = { buildLlmsTxt };
