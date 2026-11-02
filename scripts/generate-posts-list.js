const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { toSiteUrl, buildSitemap } = require('./sitemap');
const { buildLlmsTxt } = require('./llms');
// .env.local이 있으면 사용, 없으면 .env 사용
console.log('🔍 환경변수 로딩 시작...');
console.log('📁 현재 디렉토리:', process.cwd());
console.log('🔍 .env.local 파일 존재 여부:', require('fs').existsSync('.env.local'));
console.log('🔍 .env 파일 존재 여부:', require('fs').existsSync('.env'));

if (require('fs').existsSync('.env.local')) {
  console.log('📂 .env.local 파일 로딩...');
  require('dotenv').config({ path: '.env.local' });
  console.log('✅ .env.local 파일 로딩 완료');
} else {
  console.log('📂 .env.local 파일 없음, .env 파일 사용');
  require('dotenv').config();
  console.log('✅ .env 파일 로딩 완료');
}

console.log('🔍 로딩된 환경변수:');
console.log('  REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '설정됨' : '설정되지 않음');
console.log('  REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음');

// Supabase 클라이언트 설정
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다!');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl);
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 출력 파일 경로
const outputFile = path.join(__dirname, '../public/data/posts-list.json');
const sitemapFile = path.join(__dirname, '../public/sitemap.xml');
const llmsFile = path.join(__dirname, '../public/llms.txt');

// 현재 날짜
const currentDate = new Date().toISOString().split('T')[0];

async function generatePostsList() {
  try {
    console.log('🔄 Supabase에서 포스트 정보를 가져오는 중...');
    
    // Supabase에서 published된 포스트들 가져오기
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content, tags, excerpt, published_at, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`📝 Supabase에서 ${posts.length}개의 포스트를 가져왔습니다.`);

    // 포스트 정보 변환
    const postsList = [];
    const sitemapUrls = [];

    posts.forEach(post => {
      const publishedDate = post.published_at ? new Date(Number(post.published_at)).toISOString().split('T')[0] : currentDate;
      
      postsList.push({
        id: post.id,
        slug: `post-${post.id}`,
        title: post.title,
        date: publishedDate,
        tags: post.tags || [],
        excerpt: post.excerpt || []
      });

      // sitemap용 URL 추가
      sitemapUrls.push({
        loc: toSiteUrl(`posts/${post.id}`),
        lastmod: publishedDate,
        changefreq: 'monthly',
        priority: '0.7'
      });
    });

  // public/data 디렉토리 생성
  const dataDir = path.dirname(outputFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // posts-list.json 저장
  fs.writeFileSync(outputFile, JSON.stringify(postsList, null, 2));
  
  // sitemap.xml 생성
  const sitemapContent = buildSitemap(sitemapUrls, currentDate);
  fs.writeFileSync(sitemapFile, sitemapContent);
  fs.writeFileSync(llmsFile, buildLlmsTxt(postsList));
  
  console.log(`✅ posts-list.json 생성 완료!`);
  console.log(`✅ sitemap.xml 생성 완료!`);
  console.log(`✅ llms.txt 생성 완료!`);
  console.log(`📁 위치: ${outputFile}`);
  console.log(`🗺️ sitemap: ${sitemapFile}`);
  console.log(`📝 게시글 개수: ${postsList.length}개`);
  console.log(`📋 게시글 목록:`);
  postsList.forEach(post => {
    console.log(`   - ${post.slug} - ${post.date}`);
  });

  } catch (error) {
    console.error('❌ Supabase에서 포스트를 가져오는 중 오류 발생:', error);
    process.exit(1);
  }
}

// 메인 함수 실행
generatePostsList();
