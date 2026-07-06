import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';
import { 
  Box, 
  Typography, 
  Chip, 
  Link,
  Skeleton,
  Breadcrumbs,
  Paper,
  Button,
  Grid,
  Divider,
  Fab,
  Fade
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { getPostById, incrementViewCount, getAdjacentPosts, getRelatedPostsByCategory } from '../../services/posts';
import ImageModal from '../../components/ui/ImageModal';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);
  const [adjacentPosts, setAdjacentPosts] = useState({ prev: null, next: null });
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // URL에서 필터 조건 읽기 (useMemo로 메모이제이션하여 불필요한 재생성 방지)
  const categoryFromUrl = searchParams.get('category') || 'all';
  const searchFromUrl = searchParams.get('search') || '';
  const tagsFromUrl = useMemo(() => {
    return searchParams.get('tags') ? searchParams.get('tags').split(',') : [];
  }, [searchParams]);
  
  // 이미지 모달 상태
  const [imageModal, setImageModal] = useState({
    open: false,
    src: '',
    alt: ''
  });

  // 이미지 모달 열기
  const handleImageClick = (src, alt) => {
    setImageModal({
      open: true,
      src,
      alt
    });
  };

  // 이미지 모달 닫기
  const handleImageModalClose = () => {
    setImageModal({
      open: false,
      src: '',
      alt: ''
    });
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await getPostById(id);
        if (error) throw error;
        
        // 발행되지 않은 포스트는 접근 불가
        if (data && !data.is_published) {
          setPost(null);
        } else {
          setPost(data);
        }

      } catch (error) {
        console.error('게시글을 불러오는데 실패했습니다:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Mermaid 초기화
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit'
    });
  }, []);

  // 조회수 증가를 별도의 useEffect로 분리
  useEffect(() => {
    if (post && !loading && !viewCountIncremented) {
      const viewKey = `viewed_${id}`;
      
      if (!sessionStorage.getItem(viewKey)) {
        setViewCountIncremented(true); // 즉시 상태 변경
        
        incrementViewCount(id).then(({ data: updatedPost, error }) => {
          if (!error && updatedPost) {
            setPost(updatedPost);
            sessionStorage.setItem(viewKey, 'true');
          }
        }).catch((viewCountError) => {
          console.error('조회수 증가 실패:', viewCountError);
          setViewCountIncremented(false); // 에러 시 상태 복구
        });
      } else {
        setViewCountIncremented(true);
      }
    }
  }, [post, id, loading, viewCountIncremented]);

  // 이전글/다음글 조회
  useEffect(() => {
    if (!post || !post.published_at) return;

    const fetchAdjacentPosts = async () => {
      const { prev, next, error } = await getAdjacentPosts(
        post.id,
        post.published_at,
        categoryFromUrl,
        searchFromUrl,
        tagsFromUrl
      );

      if (!error) {
        setAdjacentPosts({ prev, next });
      }
    };

    fetchAdjacentPosts();
  }, [post, categoryFromUrl, searchFromUrl, tagsFromUrl]);

  // 같은 카테고리의 관련 포스트 조회
  useEffect(() => {
    if (!post) return;

    const fetchRelatedPosts = async () => {
      const { data, error } = await getRelatedPostsByCategory(
        post.id,
        categoryFromUrl,
        6
      );

      if (!error && data) {
        setRelatedPosts(data);
      }
    };

    fetchRelatedPosts();
  }, [post, categoryFromUrl]);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      // 300px 이상 스크롤되면 버튼 표시
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 포스트 네비게이션 컴포넌트
  const PostNavigation = ({ prev, next }) => {
    const handleNavigate = (postId) => {
      // 현재 URL 파라미터를 유지하면서 이동
      const params = new URLSearchParams(searchParams);
      navigate(`/posts/${postId}?${params.toString()}`);
    };

    if (!prev && !next) return null;

    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: 2,
        my: 3 
      }}>
        {prev ? (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => handleNavigate(prev.id)}
            sx={{
              flex: 1,
              justifyContent: 'flex-start',
              textAlign: 'left',
              borderColor: '#000000',
              color: '#000000',
              '&:hover': {
                borderColor: '#000000',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <Box>
              <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                이전글
              </Typography>
              <Typography variant="body2" sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {prev.title}
              </Typography>
            </Box>
          </Button>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {next ? (
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => handleNavigate(next.id)}
            sx={{
              flex: 1,
              justifyContent: 'flex-end',
              textAlign: 'right',
              borderColor: '#000000',
              color: '#000000',
              '&:hover': {
                borderColor: '#000000',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <Box>
              <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                다음글
              </Typography>
              <Typography variant="body2" sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {next.title}
              </Typography>
            </Box>
          </Button>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}
      </Box>
    );
  };

  // 관련 포스트 리스트 컴포넌트
  const RelatedPosts = ({ posts }) => {
    if (!posts || posts.length === 0) return null;

    const handlePostClick = (postId) => {
      const params = new URLSearchParams(searchParams);
      navigate(`/posts/${postId}?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 날짜 포맷팅
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      
      let date;
      if (typeof timestamp === 'bigint' || typeof timestamp === 'number') {
        date = new Date(Number(timestamp));
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return (
      <Box sx={{ mt: 6, mb: 4 }}>
        <Divider sx={{ mb: 4 }} />
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          같은 카테고리의 다른 글
        </Typography>
        <Grid container spacing={2}>
          {posts.map((relatedPost) => (
            <Grid item xs={12} sm={6} key={relatedPost.id}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    elevation: 3,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => handlePostClick(relatedPost.id)}
              >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', fontSize: '1rem' }}>
                  {relatedPost.title}
                </Typography>
                
                {relatedPost.excerpt && Array.isArray(relatedPost.excerpt) && relatedPost.excerpt.length > 0 && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.5
                    }}
                  >
                    {relatedPost.excerpt.filter(item => item.trim()).join(' | ')}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {relatedPost.tags && Array.isArray(relatedPost.tags) && relatedPost.tags.slice(0, 3).map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  ))}
                  {relatedPost.tags && relatedPost.tags.length > 3 && (
                    <Chip 
                      label={`+${relatedPost.tags.length - 3}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: '20px' }}
                    />
                  )}
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  {formatDate(relatedPost.published_at)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Mermaid 다이어그램 렌더링을 위한 컴포넌트
  const MermaidDiagram = ({ children }) => {
    const mermaidRef = useRef(null);
    const containerRef = useRef(null);
    const [svg, setSvg] = useState(null);
    const diagramIdRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
      if (mermaidRef.current && !svg) {
        const id = diagramIdRef.current;
        // children을 문자열로 변환 (React 요소 배열일 수 있음)
        let code = '';
        if (Array.isArray(children)) {
          code = children.map(child => 
            typeof child === 'string' ? child : String(child)
          ).join('');
        } else {
          code = String(children);
        }
        code = code.replace(/\n$/, '').trim();

        if (!code) return;

        // Mermaid 렌더링
        mermaid.render(id, code)
          .then((result) => {
            // 렌더링된 SVG를 바로 조정하여 깜빡임 방지
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = result.svg;
            const svgElement = tempDiv.querySelector('svg');
            
            if (svgElement) {
              // subgraph/cluster 배경 박스 크기 조정
              // subgraph의 배경 rect를 찾아서 크게 만듦
              const subgraphGroups = svgElement.querySelectorAll('g.cluster, g.subgraph');
              subgraphGroups.forEach(group => {
                // subgraph 내부의 배경 rect 찾기 (첫 번째 rect가 보통 배경)
                const bgRect = group.querySelector('rect:first-of-type');
                if (bgRect) {
                  const currentWidth = parseFloat(bgRect.getAttribute('width')) || 0;
                  const currentHeight = parseFloat(bgRect.getAttribute('height')) || 0;
                  if (currentWidth > 0) {
                    bgRect.setAttribute('width', currentWidth + 60); // 배경 박스를 크게
                  }
                  if (currentHeight > 0) {
                    bgRect.setAttribute('height', currentHeight + 40);
                  }
                }
              });
              
              // 클래스로 직접 찾기
              const subgraphRects = svgElement.querySelectorAll('rect.cluster, rect.subgraph');
              subgraphRects.forEach(rect => {
                const currentWidth = parseFloat(rect.getAttribute('width')) || 0;
                if (currentWidth > 0) {
                  rect.setAttribute('width', currentWidth + 60); // 배경 박스를 크게
                }
                const currentHeight = parseFloat(rect.getAttribute('height')) || 0;
                if (currentHeight > 0) {
                  rect.setAttribute('height', currentHeight + 40);
                }
              });
              
              // 노드 박스 크기 조정
              // 모든 rect를 찾되, edge가 아닌 것들만 처리
              const rects = svgElement.querySelectorAll('rect');
              let maxX = 0;
              
              rects.forEach(rect => {
                // edge가 아닌 노드 박스인지 확인
                const parent = rect.parentElement;
                const isEdge = rect.classList.contains('edge') || 
                               parent?.classList.contains('edge') ||
                               parent?.classList.contains('edgeLabel') ||
                               rect.classList.contains('edgeLabel');
                
                // subgraph/cluster는 이미 처리했으므로 제외
                const isSubgraph = rect.classList.contains('cluster') ||
                                   rect.classList.contains('subgraph') ||
                                   parent?.classList.contains('cluster') ||
                                   parent?.classList.contains('subgraph');
                
                // 노드 박스인 경우 (edge가 아니고 subgraph도 아닌 경우)
                if (!isEdge && !isSubgraph && parent) {
                  // 더 포괄적인 조건: node, nodeLabel, 또는 g 태그 내부의 rect
                  const isNode = parent.classList.contains('node') || 
                                 parent.classList.contains('nodeLabel') ||
                                 rect.classList.contains('node') || 
                                 rect.classList.contains('nodeLabel') ||
                                 (parent.tagName === 'g' && !parent.classList.contains('edge') && !parent.classList.contains('cluster'));
                  if (isNode) {
                    const currentWidth = parseFloat(rect.getAttribute('width')) || 0;
                    if (currentWidth > 0) {
                      const newWidth = currentWidth + 25;
                      rect.setAttribute('width', newWidth);
                      
                      const rectX = parseFloat(rect.getAttribute('x')) || 0;
                      const rightEdge = rectX + newWidth;
                      if (rightEdge > maxX) {
                        maxX = rightEdge;
                      }
                      
                      // 텍스트 및 foreignObject 조정
                      const nodeGroup = parent.closest('g.node') || parent.closest('g') || parent;
                      if (nodeGroup) {
                        const textElements = nodeGroup.querySelectorAll('text');
                        textElements.forEach(text => {
                          const boxX = parseFloat(rect.getAttribute('x')) || 0;
                          text.setAttribute('x', boxX + newWidth / 2);
                        });
                        
                        const foreignObjects = nodeGroup.querySelectorAll('foreignObject');
                        foreignObjects.forEach(fo => {
                          const currentFoWidth = parseFloat(fo.getAttribute('width')) || 0;
                          if (currentFoWidth > 0) {
                            const newFoWidth = currentFoWidth + 30;
                            fo.setAttribute('width', newFoWidth);
                            fo.style.overflow = 'visible';
                            
                            const allElements = fo.querySelectorAll('*');
                            allElements.forEach(el => {
                              const currentElWidth = parseFloat(el.style.width) || parseFloat(el.getAttribute('width')) || 0;
                              if (currentElWidth > 0) {
                                el.style.width = (currentElWidth + 25) + 'px';
                              } else {
                                el.style.width = newFoWidth + 'px';
                              }
                              el.style.boxSizing = 'border-box';
                              el.style.overflow = 'visible';
                              el.style.overflowX = 'visible';
                              el.style.overflowY = 'visible';
                            });
                          }
                        });
                      }
                    }
                  }
                }
              });
              
              // SVG 크기 조정
              const currentViewBox = svgElement.getAttribute('viewBox');
              const currentSvgWidth = parseFloat(svgElement.getAttribute('width')) || 0;
              const currentSvgHeight = parseFloat(svgElement.getAttribute('height')) || 0;
              
              if (currentViewBox) {
                const viewBoxValues = currentViewBox.split(' ');
                const viewBoxWidth = parseFloat(viewBoxValues[2]) || 0;
                const viewBoxHeight = parseFloat(viewBoxValues[3]) || 0;
                
                // 실제 콘텐츠 크기에 맞춰 viewBox 조정
                // 노드 박스들이 +25~+30 늘어났고, subgraph 배경이 +60 늘어났으므로 충분한 여유 공간 확보
                const hasSubgraph = svgElement.querySelector('g.cluster, g.subgraph, rect.cluster, rect.subgraph');
                const paddingWidth = hasSubgraph ? 100 : 60; // subgraph가 있으면 더 많이
                const paddingHeight = hasSubgraph ? 80 : 50;
                
                const newViewBoxWidth = viewBoxWidth + paddingWidth;
                const newViewBoxHeight = viewBoxHeight + paddingHeight;
                svgElement.setAttribute('viewBox', `${viewBoxValues[0]} ${viewBoxValues[1]} ${newViewBoxWidth} ${newViewBoxHeight}`);
                
                if (currentSvgWidth > 0) {
                  // subgraph가 있으면 더 크게 (3.0배), 없으면 2.5배
                  const scaleFactor = hasSubgraph ? 3.0 : 2.5;
                  
                  // viewBox가 늘어난 비율만큼 SVG 크기도 조정하여 잘림 방지
                  const viewBoxRatio = newViewBoxWidth / viewBoxWidth;
                  const adjustedWidth = (currentSvgWidth * scaleFactor) * viewBoxRatio;
                  const adjustedHeight = currentSvgHeight > 0 
                    ? (currentSvgHeight * scaleFactor) * (newViewBoxHeight / viewBoxHeight)
                    : 'auto';
                  
                  svgElement.style.width = adjustedWidth + 'px';
                  svgElement.style.height = typeof adjustedHeight === 'number' ? adjustedHeight + 'px' : adjustedHeight;
                  svgElement.style.maxWidth = 'none';
                  svgElement.style.maxHeight = 'none';
                  svgElement.style.minWidth = adjustedWidth + 'px';
                }
              }
              
              setSvg(tempDiv.innerHTML);
            } else {
              setSvg(result.svg);
            }
          })
          .catch((error) => {
            console.error('Mermaid 렌더링 실패:', error);
            setSvg(`<div style="color: red; padding: 20px;">Mermaid 렌더링 오류: ${error.message}</div>`);
          });
      }
    }, [children, svg]);


    if (svg) {
      return (
        <div 
          ref={containerRef}
          style={{ 
            margin: '20px 0',
            textAlign: 'center',
            overflow: 'auto'
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    }

    return (
      <div 
        ref={mermaidRef} 
        style={{ 
          margin: '20px 0',
          textAlign: 'center',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}
      >
        다이어그램 로딩 중...
      </div>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Breadcrumbs Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="60%" height={24} />
        </Box>

        {/* Header Skeleton */}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Skeleton variant="text" width="80%" height={48} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="90%" height={24} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width={70} height={32} sx={{ borderRadius: 2 }} />
          </Box>
        </Paper>

        {/* Content Skeleton */}
        <Paper elevation={1} sx={{ p: 4 }}>
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="95%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="85%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="95%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
        </Paper>

        {/* Back Button Skeleton */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Skeleton variant="text" width={200} height={24} />
        </Box>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          게시글을 찾을 수 없습니다
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          요청하신 게시글이 존재하지 않거나 삭제되었습니다.
        </Typography>
        <Link 
          component={RouterLink} 
          to={`/posts?${searchParams.toString()}`}
          sx={{ 
            textDecoration: 'none',
            color: '#000000',
            fontWeight: 'bold'
          }}
        >
          ← 게시글 목록으로 돌아가기
        </Link>
      </Box>
    );
  }

  // 날짜 포맷팅
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    // bigint 타입의 epoch milliseconds를 처리
    let date;
    if (typeof timestamp === 'bigint' || typeof timestamp === 'number') {
      date = new Date(Number(timestamp));
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const excerptText = Array.isArray(post.excerpt)
    ? post.excerpt.filter(Boolean).join(' ')
    : (post.excerpt || '');

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {post && (
        <Helmet>
          {/* react-helmet-async v3(React 19 경로)는 <title>의 자식이 여러 개(표현식+문자열)면
              hoist하지 못하고 빈 <title />을 렌더링함 → 반드시 단일 표현식(템플릿 리터럴)으로 전달 */}
          <title>{`${post.title} | DevTaco Blog`}</title>
          <meta name="description" content={excerptText} />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={excerptText} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`https://devtaco30.github.io/devtaco-blog/posts/${post.id}`} />
          <meta name="twitter:card" content="summary" />
        </Helmet>
      )}
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          component={RouterLink} 
          to={`/posts?${searchParams.toString()}`}
          sx={{ 
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          게시글 목록
        </Link>
        <Typography color="text.primary">{post.title}</Typography>
      </Breadcrumbs>

      {/* 상단 포스트 네비게이션 */}
      <PostNavigation prev={adjacentPosts.prev} next={adjacentPosts.next} />

      {/* 게시글 헤더 */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          {post.title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          {Array.isArray(post.excerpt) && post.excerpt.length > 0 
            ? post.excerpt.filter(item => item.trim()).join(' | ')
            : ''
          }
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {post.tags && Array.isArray(post.tags) && post.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
        
        <Typography variant="body2" color="text.secondary">
                          {formatDate(post.published_at)}
        </Typography>
      </Paper>

      {/* 게시글 내용 */}
      <Paper elevation={1} sx={{ p: 4 }}>
        <Box 
          sx={{ 
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              fontWeight: 'bold',
              mt: 4,
              mb: 2
            },
            '& h1': { fontSize: '2rem' },
            '& h2': { fontSize: '1.75rem' },
            '& h3': { fontSize: '1.5rem' },
            '& p': { 
              mb: 2, 
              lineHeight: 1.8,
              fontSize: '1.1rem'
            },
            '& ul, & ol': { 
              mb: 2, 
              pl: 3 
            },
            '& li': { 
              mb: 1,
              lineHeight: 1.6
            },
            '& code': {
              backgroundColor: 'grey.100',
              padding: '2px 6px',
              borderRadius: 1,
              fontFamily: 'monospace'
            },
            '& pre': {
              backgroundColor: 'grey.100',
              padding: 2,
              borderRadius: 1,
              overflow: 'auto',
              mb: 3
            },
            '& pre code': {
              backgroundColor: 'transparent',
              padding: 0
            },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: '#000000',
              pl: 2,
              ml: 0,
              fontStyle: 'italic',
              color: 'rgba(0, 0, 0, 0.6)'
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              mb: 4,
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              fontSize: '0.95rem',
              fontFamily: 'inherit'
            },
            '& th, & td': {
              border: 'none',
              padding: '16px 20px',
              textAlign: 'left',
              verticalAlign: 'middle'
            },
            '& th': {
              backgroundColor: '#2c3e50',
              color: '#e74c3c'
            }
          }}
        >
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkMath]} 
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            components={{
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match && match[1];
                
                // Mermaid 다이어그램 처리
                if (language === 'mermaid') {
                  return <MermaidDiagram>{children}</MermaidDiagram>;
                }
                
                // 일반 코드 블록 (기존 처리)
                if (!inline && language) {
                  return (
                    <pre style={{ 
                      backgroundColor: '#f5f5f5',
                      padding: '16px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      marginBottom: '24px'
                    }}>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                }
                
                // 인라인 코드
                return (
                  <code 
                    className={className} 
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              img: ({node, ...props}) => {
                // custom-size 클래스가 있는 이미지는 원래 크기 유지
                if (props.className && props.className.includes('custom-size')) {
                  return (
                    <img 
                      {...props} 
                      src={props.src}
                      alt={props.alt || 'Blog post image'}
                      onClick={() => handleImageClick(props.src, props.alt)}
                                          style={{
                      cursor: 'pointer',
                      transition: 'opacity 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                    />
                  );
                }
                // 마크다운 이미지와 일반 이미지는 모두 60%로 줄이기
                return (
                  <img 
                    {...props} 
                    src={props.src}
                    alt={props.alt || 'Blog post image'}
                    onClick={() => handleImageClick(props.src, props.alt)}
                    style={{ 
                      maxWidth: '60%', 
                      height: 'auto',
                      display: 'block',
                      margin: '20px auto',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  />
                );
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </Box>
      </Paper>

      {/* 같은 카테고리의 다른 글 */}
      <RelatedPosts posts={relatedPosts} />

      {/* 뒤로가기 버튼 */}
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Link 
          component={RouterLink} 
          to={`/posts?${searchParams.toString()}`}
          sx={{ 
            textDecoration: 'none',
            color: '#000000',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          <ArrowBackIcon />
          게시글 목록으로 돌아가기
        </Link>
      </Box>

      {/* 이미지 모달 */}
      <ImageModal
        open={imageModal.open}
        onClose={handleImageModalClose}
        src={imageModal.src}
        alt={imageModal.alt}
      />

      {/* 맨 위로 버튼 */}
      <Fade in={showScrollTop}>
        <Fab
          color="primary"
          size="medium"
          aria-label="scroll to top"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            },
            zIndex: 1000
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Fade>
    </Box>
  );
};

export default BlogPost;
