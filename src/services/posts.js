import { supabase } from '../supabase';

// 모든 포스트 조회
export const getAllPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { data: null, error };
  }
};

// 단일 포스트 조회 (ID로)
export const getPostById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { data: null, error };
  }
};

// 새 포스트 생성
export const createPost = async (postData) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating post:', error);
    return { data: null, error };
  }
};

// 포스트 수정
export const updatePost = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error updating post:', error);
    return { data: null, error };
  }
};

// 포스트 삭제
export const deletePost = async (id) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { error };
  }
};

// 포스트 발행 상태 변경
export const togglePostPublish = async (id, isPublished) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({ is_published: isPublished })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error toggling post publish:', error);
    return { data: null, error };
  }
};

// 조회수 증가
export const incrementViewCount = async (id) => {
  try {
    // 조회수 증가
    const { error: incrementError } = await supabase
      .rpc('increment_view_count', { post_id: id });

    if (incrementError) throw incrementError;

    // 업데이트된 게시글 데이터 가져오기
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    return { data, error: null };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return { data: null, error };
  }
};

// 무한 스크롤용: 전체 게시글 조회 (5개씩)
export const getPostsWithPagination = async (lastCreatedAt = null, limit = 5, categoryKey = null) => {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    // 카테고리 필터링
    if (categoryKey && categoryKey !== 'all') {
      query = query.eq('category_key', categoryKey);
    }

    // 마지막 게시글 이후부터 조회
    if (lastCreatedAt) {
      query = query.lt('created_at', lastCreatedAt);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching posts with pagination:', error);
    return { data: null, error };
  }
};

// 무한 스크롤용: 검색 결과 조회 (5개씩)
export const searchPostsWithPagination = async (searchTerm, tags = [], lastCreatedAt = null, limit = 5, categoryKey = null) => {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    // 카테고리 필터링
    if (categoryKey && categoryKey !== 'all') {
      query = query.eq('category_key', categoryKey);
    }

    // 검색어 필터링
    if (searchTerm && searchTerm.trim()) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
    }

    // 태그 필터링
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    // 마지막 게시글 이후부터 조회
    if (lastCreatedAt) {
      query = query.lt('created_at', lastCreatedAt);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error searching posts with pagination:', error);
    return { data: null, error };
  }
};

/**
 * 번호형 페이지네이션: 발행된 포스트만 조회 (BlogList용)
 * @param {number} page - 페이지 번호 (1부터 시작)
 * @param {number} limit - 페이지당 포스트 개수
 * @param {string|null} categoryKey - 카테고리 키 (null이면 전체)
 * @returns {Promise<{data: Array, count: number, error: Error|null}>}
 */
export const getPostsWithPageNumber = async (page = 1, limit = 10, categoryKey = null) => {
  try {
    // 페이지 번호 유효성 검사
    if (page < 1) page = 1;
    
    // offset 계산 (0부터 시작)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 기본 쿼리 구성 (발행된 포스트만)
    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(from, to);

    // 카테고리 필터링
    if (categoryKey && categoryKey !== 'all') {
      query = query.eq('category_key', categoryKey);
    }

    const { data, count, error } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching posts with page number:', error);
    return { data: null, count: 0, error };
  }
};

/**
 * 번호형 페이지네이션: 모든 포스트 조회 (PostManager용)
 * 발행 여부와 관계없이 모든 포스트를 조회합니다.
 * @param {number} page - 페이지 번호 (1부터 시작)
 * @param {number} limit - 페이지당 포스트 개수
 * @returns {Promise<{data: Array, count: number, error: Error|null}>}
 */
export const getAllPostsWithPageNumber = async (page = 1, limit = 20) => {
  try {
    // 페이지 번호 유효성 검사
    if (page < 1) page = 1;
    
    // offset 계산 (0부터 시작)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 모든 포스트 조회 (발행 여부 무관)
    const { data, count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching all posts with page number:', error);
    return { data: null, count: 0, error };
  }
};

/**
 * 번호형 페이지네이션: 검색 결과 조회 (BlogList용)
 * 검색어, 태그, 카테고리로 필터링된 발행된 포스트를 페이지네이션으로 조회합니다.
 * @param {string} searchTerm - 검색어
 * @param {Array<string>} tags - 태그 배열
 * @param {number} page - 페이지 번호 (1부터 시작)
 * @param {number} limit - 페이지당 포스트 개수
 * @param {string|null} categoryKey - 카테고리 키 (null이면 전체)
 * @returns {Promise<{data: Array, count: number, error: Error|null}>}
 */
export const searchPostsWithPageNumber = async (searchTerm, tags = [], page = 1, limit = 10, categoryKey = null) => {
  try {
    // 페이지 번호 유효성 검사
    if (page < 1) page = 1;
    
    // offset 계산 (0부터 시작)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 기본 쿼리 구성 (발행된 포스트만)
    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(from, to);

    // 카테고리 필터링
    if (categoryKey && categoryKey !== 'all') {
      query = query.eq('category_key', categoryKey);
    }

    // 검색어 필터링
    if (searchTerm && searchTerm.trim()) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
    }

    // 태그 필터링
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    const { data, count, error } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error searching posts with page number:', error);
    return { data: null, count: 0, error };
  }
};

/**
 * 특정 포스트보다 최신인 포스트 개수 조회 (페이지 계산용)
 * created_at 기준 내림차순 정렬에서, 특정 포스트보다 앞에 있는 포스트 개수를 반환합니다.
 * @param {string} targetCreatedAt - 대상 포스트의 created_at (ISO 문자열 또는 timestamp)
 * @returns {Promise<{count: number, error: Error|null}>}
 */
export const getPostCountBeforeCreatedAt = async (targetCreatedAt) => {
  try {
    if (!targetCreatedAt) {
      return { count: 0, error: null };
    }

    // created_at이 targetCreatedAt보다 큰 포스트 개수 조회
    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gt('created_at', targetCreatedAt);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting post count before created_at:', error);
    return { count: 0, error };
  }
};

/**
 * 특정 포스트의 이전/다음 포스트 조회 (같은 필터 조건 내)
 * @param {string} currentPostId - 현재 포스트 ID
 * @param {string|number|bigint} currentPublishedAt - 현재 포스트의 published_at
 * @param {string|null} categoryKey - 카테고리 키
 * @param {string} searchTerm - 검색어
 * @param {Array<string>} tags - 태그 배열
 * @returns {Promise<{prev: Object|null, next: Object|null, error: Error|null}>}
 */
export const getAdjacentPosts = async (currentPostId, currentPublishedAt, categoryKey = null, searchTerm = '', tags = []) => {
  try {
    // published_at을 숫자(timestamp)로 변환
    let publishedAtTimestamp;
    if (typeof currentPublishedAt === 'bigint' || typeof currentPublishedAt === 'number') {
      publishedAtTimestamp = Number(currentPublishedAt);
    } else {
      // ISO 문자열이나 Date 객체인 경우
      publishedAtTimestamp = new Date(currentPublishedAt).getTime();
    }

    // 이전 포스트 조회 (현재 포스트보다 최신, published_at 기준 내림차순에서 바로 위)
    let prevQuery = supabase
      .from('posts')
      .select('id, title')
      .eq('is_published', true)
      .gt('published_at', publishedAtTimestamp)
      .order('published_at', { ascending: true })
      .limit(1);

    // 다음 포스트 조회 (현재 포스트보다 이전, published_at 기준 내림차순에서 바로 아래)
    let nextQuery = supabase
      .from('posts')
      .select('id, title')
      .eq('is_published', true)
      .lt('published_at', publishedAtTimestamp)
      .order('published_at', { ascending: false })
      .limit(1);

    // 카테고리 필터링
    if (categoryKey && categoryKey !== 'all') {
      prevQuery = prevQuery.eq('category_key', categoryKey);
      nextQuery = nextQuery.eq('category_key', categoryKey);
    }

    // 검색어 필터링
    if (searchTerm && searchTerm.trim()) {
      const searchFilter = `title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`;
      prevQuery = prevQuery.or(searchFilter);
      nextQuery = nextQuery.or(searchFilter);
    }

    // 태그 필터링
    if (tags && tags.length > 0) {
      prevQuery = prevQuery.overlaps('tags', tags);
      nextQuery = nextQuery.overlaps('tags', tags);
    }

    const [prevResult, nextResult] = await Promise.all([
      prevQuery,
      nextQuery
    ]);

    if (prevResult.error) throw prevResult.error;
    if (nextResult.error) throw nextResult.error;

    return {
      prev: prevResult.data?.[0] || null,
      next: nextResult.data?.[0] || null,
      error: null
    };
  } catch (error) {
    console.error('Error fetching adjacent posts:', error);
    return { prev: null, next: null, error };
  }
};

/**
 * 같은 카테고리의 최신 포스트 조회 (현재 포스트 제외)
 * @param {string} currentPostId - 현재 포스트 ID (제외할 포스트)
 * @param {string|null} categoryKey - 카테고리 키
 * @param {number} limit - 가져올 포스트 개수
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export const getRelatedPostsByCategory = async (currentPostId, categoryKey = null, limit = 6) => {
  try {
    let query = supabase
      .from('posts')
      .select('id, title, excerpt, tags, published_at')
      .eq('is_published', true)
      .neq('id', currentPostId)
      .order('published_at', { ascending: false })
      .limit(limit);

    // 카테고리 필터링
    if (categoryKey && categoryKey !== 'all') {
      query = query.eq('category_key', categoryKey);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return { data: null, error };
  }
};

/**
 * 발행된 모든 글의 태그 목록 조회 (BlogList 사이드바의 태그 개수 집계용)
 * @returns {Promise<{data: Array<string[] | null> | null, error: Error | null}>}
 */
export const getPublishedPostTagLists = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('tags')
      .eq('is_published', true);

    if (error) throw error;
    return { data: (data || []).map((row) => row.tags), error: null };
  } catch (error) {
    console.error('Error fetching published post tags:', error);
    return { data: null, error };
  }
};
