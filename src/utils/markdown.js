import matter from 'gray-matter';

// Markdown 파일들을 동적으로 가져오는 함수
export const getAllPosts = async () => {
  const posts = [];
  
  try {
    // posts-list.json에서 게시글 목록 가져오기
    const listResponse = await fetch('/blog/data/posts-list.json');
    if (!listResponse.ok) {
      throw new Error('posts-list.json을 가져올 수 없습니다');
    }
    
    const postFiles = await listResponse.json();


    // 각 게시글 파일 가져오기
    for (const { id, slug, filename } of postFiles) {
      
      
      const response = await fetch(`/blog/posts/${filename}`);
      if (!response.ok) {
        console.error(`${slug} 파일을 가져올 수 없습니다:`, response.status);
        continue;
      }
      
      const markdownContent = await response.text();
      const { data, content } = matter(markdownContent);
      
      posts.push({
        id,
        slug,
        frontmatter: data,
        content
      });
    }

    // 날짜순으로 정렬 (최신순)
    return posts.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
  } catch (error) {
    console.error('getAllPosts 에러:', error);
    throw error;
  }
};

// 특정 게시글 가져오기 (ID 기반)
export const getPostById = async (id) => {
  try {
    // posts-list.json에서 해당 id의 파일명 찾기
    const listResponse = await fetch('/blog/data/posts-list.json');
    if (!listResponse.ok) {
      throw new Error('posts-list.json을 가져올 수 없습니다');
    }
    
    const postFiles = await listResponse.json();
    const postInfo = postFiles.find(post => post.id === id);
    
    if (!postInfo) {
      console.error(`ID를 찾을 수 없습니다: ${id}`);
      return null;
    }
    
    const response = await fetch(`/blog/posts/${postInfo.filename}`);
    if (!response.ok) {
      console.error(`${id} 파일을 가져올 수 없습니다:`, response.status);
      return null;
    }
    
    const markdownContent = await response.text();
    const { data, content } = matter(markdownContent);
    
    return {
      id,
      slug: postInfo.slug,
      frontmatter: data,
      content
    };
  } catch (error) {
    console.error(`Post not found: ${id}`, error);
    return null;
  }
};

// 기존 slug 기반 함수도 유지 (하위 호환성)
export const getPostBySlug = async (slug) => {
  try {
    const listResponse = await fetch('/blog/data/posts-list.json');
    if (!listResponse.ok) {
      throw new Error('posts-list.json을 가져올 수 없습니다');
    }
    
    const postFiles = await listResponse.json();
    const postInfo = postFiles.find(post => post.slug === slug);
    
    if (!postInfo) {
      console.error(`Slug를 찾을 수 없습니다: ${slug}`);
      return null;
    }
    
    const response = await fetch(`/blog/posts/${postInfo.filename}`);
    if (!response.ok) {
      console.error(`${slug} 파일을 가져올 수 없습니다:`, response.status);
      return null;
    }
    
    const markdownContent = await response.text();
    const { data, content } = matter(markdownContent);
    
    return {
      id: postInfo.id,
      slug,
      frontmatter: data,
      content
    };
  } catch (error) {
    console.error(`Post not found: ${slug}`, error);
    return null;
  }
};

// 태그별 게시글 필터링
export const getPostsByTag = async (tag) => {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => 
    post.frontmatter.tags && post.frontmatter.tags.includes(tag)
  );
};
