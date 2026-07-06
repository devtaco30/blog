const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');
const puppeteer = require('puppeteer');

const BUILD_DIR = path.join(__dirname, '../build');
const BASE = '/devtaco-blog';
const PORT = 5055;
// mermaid 등 클라이언트 사이드 비동기 렌더링(네트워크 유휴 이후에도 진행됨)을 위한 추가 대기 시간(ms)
const CLIENT_RENDER_GRACE_MS = 1500;

/**
 * CRA 빌드 결과물은 `/devtaco-blog/...` 절대경로로 에셋을 참조하지만
 * `build/` 디렉터리 자체에는 그 prefix 디렉터리가 없다.
 * serve-handler의 public 루트 아래에 `devtaco-blog` 심볼릭 링크로 build를 매핑해
 * `http://localhost:PORT/devtaco-blog/...` 요청이 실제 빌드 파일로 정확히 resolve되게 한다.
 */
function createServeRoot() {
  const serveRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'devtaco-blog-prerender-'));
  fs.symlinkSync(BUILD_DIR, path.join(serveRoot, 'devtaco-blog'), 'dir');
  return serveRoot;
}

// ⚠️ SIDE EFFECT: build/ 하위에 index.html 파일들을 생성/덮어쓴다.
async function main() {
  // 프리렌더 대상 경로 수집
  const postsList = JSON.parse(
    fs.readFileSync(path.join(BUILD_DIR, 'data/posts-list.json'), 'utf-8')
  );
  const posts = Array.isArray(postsList) ? postsList : (postsList.posts || []);
  const routes = ['/', '/posts', '/about', ...posts.map((p) => `/posts/${p.id}`)];

  const serveRoot = createServeRoot();

  // 정적 서버(SPA 폴백: 확장자 없는 미지정 경로 → /devtaco-blog/index.html)
  const server = http.createServer((req, res) =>
    handler(req, res, {
      public: serveRoot,
      symlinks: true,
      rewrites: [{ source: '**', destination: `${BASE}/index.html` }]
    })
  );
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, resolve);
  });

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    for (const route of routes) {
      const page = await browser.newPage();
      const url = `http://localhost:${PORT}${BASE}${route === '/' ? '/' : route}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('#root *', { timeout: 30000 });
      // 본문 텍스트(마크다운 렌더 결과)가 실제로 채워질 때까지 대기 (데이터 fetch가
      // networkidle0 이후에도 setState → 리렌더로 이어질 수 있어 보강)
      try {
        await page.waitForFunction(
          () => {
            const root = document.querySelector('#root');
            return !!root && root.innerText && root.innerText.trim().length > 50;
          },
          { timeout: 15000 }
        );
      } catch (e) {
        console.warn(`  경고: ${route} 본문 텍스트 대기 타임아웃 (계속 진행)`);
      }
      // mermaid 등 client-side 비동기 렌더링 유예 시간
      await new Promise((r) => setTimeout(r, CLIENT_RENDER_GRACE_MS));

      const html = await page.content();

      const outDir = path.join(BUILD_DIR, route === '/' ? '' : route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html);
      console.log(`prerendered: ${route}`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
    fs.rmSync(serveRoot, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error('prerender 실패:', e);
  process.exit(1);
});
