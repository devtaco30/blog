import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Skeleton,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Modal,
  Paper,
  Pagination
} from '@mui/material';
import { useNavigate, useSearchParams, useNavigationType } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { Helmet } from 'react-helmet-async';
import { getPostsWithPageNumber, searchPostsWithPageNumber, getPublishedPostTagLists } from '../../services/posts';
import { getAllCategories, getPostCountsByAllCategories } from '../../services/categories';
import BlogListSidebar from './components/BlogListSidebar';
import PostCard from './components/PostCard';
import { useSearchShortcut } from './useSearchShortcut';
import { countTags } from './tagCounts';
import { ACCENT } from './listTheme';

// UI용 "전체" 카테고리 (DB에는 존재하지 않음)
const ALL_CATEGORY = { 
  key: 'all', 
  name: '전체', 
  sort_order: 0, 
  is_active: true 
};

/** URL 동기화 시 매 렌더마다 새 []/새 배열이 들어가 selectedTags 의존 effect(디바운스 검색)가 불필요하게 재실행되는 것을 막기 위함 */
const isSameOrderedTagList = (previousTags, nextTags) =>
  previousTags.length === nextTags.length &&
  previousTags.every((tag, index) => tag === nextTags[index]);

/** posts 목록 쿼리 스코프 — URL→state 동기화 시 “방금 우리가 쓴 URL”과 구분 */
const blogListUrlScopeSignature = (params) => {
  const u = params instanceof URLSearchParams ? params : new URLSearchParams(params);
  return [
    u.get('page') || '',
    u.get('category') || '',
    u.get('search') || '',
    u.get('tags') || '',
  ].join('\u0001');
};

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  /**
   * setSearchParams 직후 한 번 layout에서 읽는 searchParams가 아직 이전 값이면
   * 그걸로 state를 덮지 않기 위해, 직전에 기록한 목표 시그니처와 다르면 동기화를 건너뛴다.
   * 뒤로가기(POP)는 예외로 항상 URL 기준으로 맞춘다.
   */
  const pendingUrlScopeSignatureRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [categories, setCategories] = useState([ALL_CATEGORY]);
  const [categoryCounts, setCategoryCounts] = useState({});
  /** 사이드바 기술 목록용: 전체 발행 글 기준 태그 개수 (불러오지 못하면 빈 배열 → 기술 묶음 숨김) */
  const [tagCounts, setTagCounts] = useState([]);
  const searchInputRef = useRef(null);
  useSearchShortcut(searchInputRef);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('all');
  /** updateUrlParams 콜백이 stale한 previousParams로 병합할 때 category 쿼리가 빠지는 것을 막기 위함 */
  const selectedCategoryKeyRef = useRef(selectedCategoryKey);
  selectedCategoryKeyRef.current = selectedCategoryKey;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  
  const POSTS_PER_PAGE = 10;

  // URL 파라미터 변경 감지 및 state 동기화 (layout: 페인트 전, 라우터 반영 직후)
  useLayoutEffect(() => {
    if (navigationType === 'POP') {
      pendingUrlScopeSignatureRef.current = null;
    }

    const sig = blogListUrlScopeSignature(searchParams);
    const pending = pendingUrlScopeSignatureRef.current;

    if (pending !== null && sig !== pending && navigationType !== 'POP') {
      return;
    }

    if (pending !== null && sig === pending) {
      pendingUrlScopeSignatureRef.current = null;
    }

    const pageFromUrl = parseInt(searchParams.get('page'), 10) || 1;
    const categoryFromUrl = searchParams.get('category') || 'all';
    const searchFromUrl = searchParams.get('search') || '';
    const tagsFromUrl = searchParams.get('tags') ? searchParams.get('tags').split(',') : [];

    setCurrentPage(pageFromUrl);
    setSelectedCategoryKey(categoryFromUrl);

    const urlImpliesActiveSearch = searchFromUrl !== '' || tagsFromUrl.length > 0;

    setSearchKeyword(searchFromUrl);
    setSelectedTags((previousTags) =>
      isSameOrderedTagList(previousTags, tagsFromUrl) ? previousTags : tagsFromUrl
    );
    setIsSearchMode(urlImpliesActiveSearch);
  }, [searchParams, navigationType]);

  // URL 업데이트: setSearchParams(prev => …)로 병합 + category는 명시하지 않으면 현재 선택값 유지(전체가 아닐 때)
  const updateUrlParams = useCallback((updates) => {
    setSearchParams((previousParams) => {
      const newParams = new URLSearchParams(previousParams);
      const categoryKeyExplicitInUpdates = Object.prototype.hasOwnProperty.call(updates, 'category');
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, value.toString());
        }
      });
      if (!categoryKeyExplicitInUpdates) {
        const categoryKeyToPersist = selectedCategoryKeyRef.current;
        if (categoryKeyToPersist && categoryKeyToPersist !== 'all') {
          newParams.set('category', categoryKeyToPersist);
        } else {
          newParams.delete('category');
        }
      }
      pendingUrlScopeSignatureRef.current = blogListUrlScopeSignature(newParams);
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  // 카테고리 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await getAllCategories();
        
        if (categoriesError) {
          console.error('카테고리 조회 에러:', categoriesError);
          throw categoriesError;
        }
        
        // "전체" 카테고리를 맨 앞에 추가 (UI용 가상 카테고리)
        // categoriesData가 null이거나 undefined인 경우 빈 배열로 처리
        const categoriesWithAll = [
          ALL_CATEGORY,
          ...(categoriesData || [])
        ];
        
        setCategories(categoriesWithAll);
        
        // 카테고리별 포스트 개수 조회
        const { data: countsData, error: countsError } = await getPostCountsByAllCategories();
        if (!countsError && countsData) {
          setCategoryCounts(countsData);
        }
      } catch (error) {
        console.error('카테고리를 불러오는데 실패했습니다:', error);
        // 에러가 발생해도 최소한 "전체" 카테고리는 표시
        setCategories([ALL_CATEGORY]);
      }
    };

    fetchCategories();
  }, []);

  // 사이드바용 전체 태그 개수 조회
  useEffect(() => {
    let isCancelled = false;
    getPublishedPostTagLists().then(({ data, error }) => {
      if (isCancelled || error || !data) return;
      setTagCounts(countTags(data));
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  // 게시글 로드 (일반 모드)
  useEffect(() => {
    let isCancelled = false;
    
    const fetchPosts = async () => {
      // 검색 모드가 아닐 때만 실행
      if (isSearchMode) return;
      
      // 깜빡임 방지: 로딩 상태를 표시하지 않고 데이터만 로드
      // 이전 데이터는 유지하면서 새 데이터를 준비
      try {
        const { data, count, error } = await getPostsWithPageNumber(currentPage, POSTS_PER_PAGE, selectedCategoryKey);
        
        // 카테고리나 페이지가 다시 변경되었으면 취소
        if (isCancelled) return;
        
        if (error) throw error;
        
        // 데이터가 준비되면 한 번에 상태 업데이트 (깜빡임 방지)
        if (data && data.length > 0) {
          // 모든 태그 수집
          const tags = new Set();
          data.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach(tag => tags.add(tag));
            }
          });
          
          // 모든 상태를 한 번에 업데이트 (이전 데이터를 유지하다가 한 번에 교체)
          setPosts(data);
          setTotalCount(count || 0);
          setAllTags(Array.from(tags).sort());
        } else {
          setPosts([]);
          setTotalCount(0);
          setAllTags([]);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('게시글을 불러오는데 실패했습니다:', error);
        }
      }
    };

    // 첫 로딩일 때만 로딩 상태 표시
    if (loading && posts.length === 0) {
      setLoading(true);
      fetchPosts().finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });
    } else {
      // 카테고리나 페이지 변경 시에는 로딩 상태 없이 데이터만 로드
      fetchPosts();
    }

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryKey, currentPage, isSearchMode]); // selectedCategoryKey나 currentPage가 변경될 때마다 다시 로드
    // loading과 posts.length는 의도적으로 dependency에서 제외 (첫 로딩 체크용, 추가 시 불필요한 재실행 발생)

  // 검색 실행
  const executeSearch = useCallback(async () => {
    if (!searchKeyword.trim() && selectedTags.length === 0) {
      // 검색 조건이 없으면 일반 모드로 전환
      setIsSearchMode(false);
      setCurrentPage(1);
      updateUrlParams({ 
        page: 1,
        search: null,
        tags: null
      });
      return;
    }

    try {
      // 검색 모드로 전환
      setIsSearchMode(true);
      setCurrentPage(1);
      
      updateUrlParams({ 
        page: 1,
        search: searchKeyword || null,
        tags: selectedTags.length > 0 ? selectedTags : null
      });
      
      const { data, count, error } = await searchPostsWithPageNumber(
        searchKeyword, 
        selectedTags, 
        1, 
        POSTS_PER_PAGE, 
        selectedCategoryKey
      );
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setPosts(data);
        setSearchTotalCount(count || 0);
        
        // 모든 태그 수집
        const tags = new Set();
        data.forEach(post => {
          if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags).sort());
      } else {
        setPosts([]);
        setSearchTotalCount(0);
        setAllTags([]);
      }
    } catch (error) {
      console.error('검색에 실패했습니다:', error);
    }
  }, [searchKeyword, selectedTags, selectedCategoryKey, updateUrlParams]);

  // 검색어나 태그 변경 시 검색 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch();
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, selectedTags]); // executeSearch를 dependency에서 제거하여 불필요한 재실행 방지

  // 검색 모드에서 페이지 변경 시 검색 결과 다시 로드
  useEffect(() => {
    if (!isSearchMode) return;
    
    let isCancelled = false;
    
    const fetchSearchResults = async () => {
      try {
        const { data, count, error } = await searchPostsWithPageNumber(
          searchKeyword, 
          selectedTags, 
          currentPage, 
          POSTS_PER_PAGE, 
          selectedCategoryKey
        );
        
        if (isCancelled) return;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPosts(data);
          setSearchTotalCount(count || 0);
        } else {
          setPosts([]);
          setSearchTotalCount(0);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('검색 결과를 불러오는데 실패했습니다:', error);
        }
      }
    };

    fetchSearchResults();
    
    return () => {
      isCancelled = true;
    };
  }, [currentPage, isSearchMode, searchKeyword, selectedTags, selectedCategoryKey]);



  // 검색어로 필터링된 태그들
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTagClick = (tag) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    setIsSearchModalOpen(false);
    
    // 태그 변경 시 즉시 검색 실행
    const newSearchKeyword = searchKeyword;
    
    if (newTags.length === 0 && !newSearchKeyword.trim()) {
      // 검색 조건이 없으면 일반 모드로 전환
      setIsSearchMode(false);
      setCurrentPage(1);
      updateUrlParams({ 
        page: 1,
        search: null,
        tags: null
      });
    } else {
      // 검색 모드 유지
      setIsSearchMode(true);
      setCurrentPage(1);
      updateUrlParams({ 
        page: 1,
        search: newSearchKeyword || null,
        tags: newTags.length > 0 ? newTags : null
      });
      
      // 검색 API 호출
      searchPostsWithPageNumber(
        newSearchKeyword,
        newTags,
        1,
        POSTS_PER_PAGE,
        selectedCategoryKey
      ).then(({ data, count, error }) => {
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPosts(data);
          setSearchTotalCount(count || 0);
          
          const tags = new Set();
          data.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach(tag => tags.add(tag));
            }
          });
          setAllTags(Array.from(tags).sort());
        } else {
          setPosts([]);
          setSearchTotalCount(0);
          setAllTags([]);
        }
      }).catch(error => {
        console.error('검색에 실패했습니다:', error);
      });
    }
  };

  const handleSearchModalOpen = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchModalClose = () => {
    setIsSearchModalOpen(false);
  };

  const handlePostClick = (post) => {
    // 현재 URL 파라미터를 유지하면서 포스트로 이동
    const params = new URLSearchParams(searchParams);
    navigate(`/posts/${post.id}?${params.toString()}`);
  };

  // 카테고리 선택 핸들러
  const handleCategoryClick = (categoryKey) => {
    setSelectedCategoryKey(categoryKey);
    setSearchKeyword('');
    setSelectedTags([]);
    setIsSearchMode(false);
    setCurrentPage(1);
    
    updateUrlParams({ 
      page: 1,
      category: categoryKey === 'all' ? null : categoryKey,
      search: null,
      tags: null
    });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    updateUrlParams({ page: value });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Helmet>
          <title>게시글 목록 | DevTaco Blog</title>
          <meta name="description" content="Java · Kotlin 백엔드 개발 경험과 학습 기록을 공유하는 기술 블로그의 게시글 목록" />
        </Helmet>
        <Typography variant="h4" sx={{ mb: 4 }}>
          게시글 목록
        </Typography>
        <Box sx={{ display: 'grid', gap: 3 }}>
          {[1, 2, 3].map((item) => (
            <Paper key={item} elevation={1} sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
              </Box>
            </Paper>
          ))}
          
          {/* 검색 결과가 없음 */}
          {!loading && posts.length === 0 && isSearchMode && (
            <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
              <Typography variant="body2">
                검색 결과가 없습니다.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        minHeight: '100vh',
        '@media (max-width:760px)': { flexDirection: 'column', alignItems: 'stretch' },
      }}
    >
      <Helmet>
        <title>게시글 목록 | DevTaco Blog</title>
        <meta name="description" content="Java · Kotlin 백엔드 개발 경험과 학습 기록을 공유하는 기술 블로그의 게시글 목록" />
      </Helmet>

      {/* 사이드바: 본문 컨테이너 밖, 화면 왼쪽 끝에 붙는다 */}
      <BlogListSidebar
        categories={categories}
        categoryCounts={categoryCounts}
        selectedCategoryKey={selectedCategoryKey}
        onCategoryClick={handleCategoryClick}
        tagCounts={tagCounts}
        selectedTags={selectedTags}
        onTagToggle={handleTagClick}
        onOpenTagModal={handleSearchModalOpen}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: '32px 40px' } }}>
      <Box sx={{ maxWidth: 1080 }}>
      <Typography component="h1" sx={{ fontSize: 26, fontWeight: 800, mb: 2 }}>
        우아하고 싶은 포스트
      </Typography>

      {/* 검색 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          inputRef={searchInputRef}
          placeholder="게시글 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              executeSearch();
            }
          }}
          size="small"
          sx={{
            flex: 1,
            minWidth: 200,
            maxWidth: 420,
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT.main },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Box
                  component="kbd"
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    px: '5px',
                    fontSize: 11,
                    color: '#6b7280',
                    '@media (max-width:760px)': { display: 'none' },
                  }}
                >
                  Ctrl K
                </Box>
              </InputAdornment>
            ),
          }}
        />

        {/* 검색 실행 버튼 */}
        <IconButton
          onClick={() => executeSearch()}
          sx={{
            border: '1px solid #ddd',
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
          title="검색"
        >
          <SearchIcon />
        </IconButton>

        {selectedTags.length > 0 && (
          <Chip
            label={`선택된 태그: ${selectedTags.length}개`}
            onDelete={() => {
              setSelectedTags([]);
              setCurrentPage(1);
              updateUrlParams({ tags: null, page: 1 });

              // 검색어도 없으면 일반 모드로 전환
              if (!searchKeyword.trim()) {
                setIsSearchMode(false);
              }
            }}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* 게시글 목록 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '10px' }}>
        {posts.length === 0 && (
          <Typography sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            조건에 맞는 글이 없습니다.
          </Typography>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            categoryName={(categories.find((category) => category.key === post.category_key) || {}).name || ''}
            onClick={handlePostClick}
            onTagClick={handleTagClick}
          />
        ))}
      </Box>

      {/* 페이지네이션 */}
      {!loading && posts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={Math.ceil((isSearchMode ? searchTotalCount : totalCount) / POSTS_PER_PAGE)}
            page={currentPage}
            onChange={handlePageChange}
            size="large"
            sx={{
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: ACCENT.main,
                color: '#ffffff',
                '&:hover': { backgroundColor: ACCENT.main },
              },
            }}
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      </Box>
      </Box>

      {/* 검색 모달 */}
      <Modal
        open={isSearchModalOpen}
        onClose={handleSearchModalClose}
        aria-labelledby="search-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            태그 검색
          </Typography>
          
          <TextField
            fullWidth
            placeholder="태그 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filteredTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagClick(tag)}
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default BlogList;
