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

  // ⚠️ 중요(메타 중복/누수 버그의 근본 원인이었음): 아래 루프는 "/" 라우트를 처리하면서
  // build/index.html "자체"를 그 결과물로 덮어쓴다. 그런데 이 파일은 동시에
  // serve-handler의 SPA 폴백(rewrite) 대상이기도 했다. 즉 "/"가 먼저 처리되고 나면
  // 그 이후 처리되는 다른 모든 라우트(/posts, /about, /posts/:id ...)가 이미 Home의
  // <title>/<meta>가 구워진 "오염된 셸" 위에서 하이드레이션하게 되고, react-helmet-async
  // (React 19 경로)는 자신이 렌더하지 않은 기존 DOM 노드를 정리하지 못하므로 그 잔여
  // 태그가 그대로 남아 최종 캡처에 누수된다(예: BlogPost 페이지에 Home의 <title>이
  // 함께 찍히는 현상). React 19 hydration 버그가 아니라 이 스크립트가 자기 출력물을
  // 자기 입력(SPA 셸)으로 재사용한 것이 원인이다.
  // 해결: 루프 시작 전 "원본(pristine)" index.html을 심볼릭 링크 바깥의 별도 파일로
  // 스냅샷해두고, SPA 폴백은 항상 이 스냅샷만 가리키게 하여 루프 도중 build/index.html이
  // 어떻게 바뀌든 다른 라우트의 하이드레이션 셸에 영향을 주지 않게 한다.
  fs.copyFileSync(
    path.join(BUILD_DIR, 'index.html'),
    path.join(serveRoot, '__prerender-shell.html')
  );
  return serveRoot;
}

// ⚠️ SIDE EFFECT: build/ 하위에 index.html 파일들을 생성/덮어쓴다.
async function main() {
  // 프리렌더 대상 경로 수집
  const postsList = JSON.parse(
    fs.readFileSync(path.join(BUILD_DIR, 'data/posts-list.json'), 'utf-8')
  );
  const posts = Array.isArray(postsList) ? postsList : (postsList.posts || []);
  const allRoutes = ['/', '/posts', '/about', ...posts.map((p) => `/posts/${p.id}`)];

  // 단일 라우트 인자(예: `node scripts/prerender.js /posts/67`)가 주어지면 해당 라우트만
  // 프리렌더한다. 61개 라우트 전체(~193초)를 기다리지 않고 특정 라우트만 빠르게 반복
  // 검증하기 위한 개발용 옵션이며, 인자가 없으면 기존 전체 라우트 동작과 동일하다.
  const requestedRoute = process.argv[2];
  let routes = allRoutes;
  if (requestedRoute) {
    if (!allRoutes.includes(requestedRoute)) {
      console.error(
        `요청한 라우트를 찾을 수 없습니다: ${requestedRoute}\n사용 가능한 라우트 예: ${allRoutes.slice(0, 5).join(', ')}...`
      );
      process.exit(1);
    }
    routes = [requestedRoute];
  }

  const serveRoot = createServeRoot();

  // 정적 서버(SPA 폴백: 확장자 없는 미지정 경로 → /devtaco-blog/index.html)
  const server = http.createServer((req, res) =>
    handler(req, res, {
      public: serveRoot,
      symlinks: true,
      rewrites: [{ source: '**', destination: '/__prerender-shell.html' }]
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
