import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import MDEditor from '@uiw/react-md-editor';
import { 
  getAllPostsWithPageNumber,
  getPostById,
  getPostCountBeforeCreatedAt,
  createPost, 
  updatePost, 
  deletePost, 
  togglePostPublish 
} from '../../services/posts';
import { getAllCategories } from '../../services/categories';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useAuth } from '../../contexts/AuthContext';

const PostManager = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: ['', '', ''], // 최대 3개 배열
    tags: [],
    category_key: 'general', // 기본값 설정
    is_published: false,
    is_featured: true // Home 노출 여부 (기본값 true)
  });
  const [tagsInput, setTagsInput] = useState(''); // 태그 입력 문자열
  const [editingPost, setEditingPost] = useState(null);
  const [editingTagsInput, setEditingTagsInput] = useState(''); // 수정 다이얼로그용 태그 입력 문자열
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [postIdSearch, setPostIdSearch] = useState(''); // 포스트 번호 검색
  const [highlightedPostId, setHighlightedPostId] = useState(null); // 하이라이트할 포스트 ID
  const POSTS_PER_PAGE = 20;

  // 이미지 업로드 훅 사용
  const {
    uploading,
    tempImages,
    moveToPermanent,
    handlePasteImage,
    handleDropImage,
    cleanup
  } = useImageUpload();

  // 포스트 조회 (페이지네이션)
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count, error } = await getAllPostsWithPageNumber(currentPage, POSTS_PER_PAGE);
      if (error) throw error;
      setPosts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      showSnackbar('포스트 조회 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // 다음 id 계산 (자동 증가) - 전체 포스트 기준으로 계산하기 위해 별도 조회 필요
  const getNextId = () => {
    // 현재 페이지의 포스트만으로는 정확한 다음 ID를 알 수 없으므로
    // 간단히 현재 페이지의 최대 ID + 1을 반환
    if (posts.length === 0) return 1;
    const maxId = Math.max(...posts.map(post => parseInt(post.id) || 0));
    return maxId + 1;
  };

  // 포스트 번호로 조회 - 리스팅에서 찾아서 하이라이트
  const handleSearchByPostId = async () => {
    const postId = parseInt(postIdSearch.trim());
    if (!postId || isNaN(postId)) {
      showSnackbar('유효한 포스트 번호를 입력해주세요.', 'error');
      return;
    }

    try {
      const { data, error } = await getPostById(postId);
      if (error) throw error;
      
      if (!data) {
        showSnackbar(`포스트 #${postId}를 찾을 수 없습니다.`, 'error');
        return;
      }

      // 포스트를 찾았으면 하이라이트 설정
      setHighlightedPostId(postId);
      setPostIdSearch(''); // 검색 필드 초기화
      
      // 현재 페이지에 해당 포스트가 있는지 확인
      const isInCurrentPage = posts.some(p => p.id === postId);
      
      if (!isInCurrentPage) {
        // 포스트가 현재 페이지에 없으면, SQL COUNT 쿼리로 효율적으로 페이지 계산
        // created_at 기준 내림차순 정렬이므로, 해당 포스트보다 최신인 포스트 개수를 세어서 페이지 계산
        const { count: newerPostCount, error: countError } = await getPostCountBeforeCreatedAt(data.created_at);
        
        if (countError) {
          showSnackbar('포스트 위치를 찾는 중 오류가 발생했습니다.', 'error');
          setHighlightedPostId(null);
          return;
        }
        
        // 해당 포스트보다 최신인 포스트가 newerPostCount개 있으므로,
        // 해당 포스트는 (newerPostCount + 1)번째 포스트입니다.
        // 페이지 계산: (newerPostCount / POSTS_PER_PAGE) + 1
        const calculatedPage = Math.floor(newerPostCount / POSTS_PER_PAGE) + 1;
        
        setCurrentPage(calculatedPage);
        // 페이지 변경 후 포스트가 로드되면 하이라이트 및 스크롤
        setTimeout(() => {
          setHighlightedPostId(postId);
          setTimeout(() => {
            const element = document.getElementById(`post-${postId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 200);
        }, 300);
        showSnackbar(`포스트 #${postId}를 찾았습니다. (${calculatedPage}페이지)`, 'success');
      } else {
        // 현재 페이지에 있으면 하이라이트만
        showSnackbar(`포스트 #${postId}를 찾았습니다.`, 'success');
        // 해당 포스트로 스크롤
        setTimeout(() => {
          const element = document.getElementById(`post-${postId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
      
      // 5초 후 하이라이트 제거
      setTimeout(() => {
        setHighlightedPostId(null);
      }, 5000);
    } catch (error) {
      showSnackbar('포스트 조회 중 오류가 발생했습니다.', 'error');
      setHighlightedPostId(null);
    }
  };

  // 새 포스트 생성
  const handleCreatePost = async () => {
    if (!newPost.title.trim()) {
      showSnackbar('제목은 필수입니다.', 'error');
      return;
    }

    try {
      // excerpt에서 빈 문자열 제거하고 최대 3개만 유지
      const cleanExcerpt = newPost.excerpt.filter(item => item.trim()).slice(0, 3);
      
      const postData = {
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags.length > 0 ? newPost.tags : [],
        excerpt: cleanExcerpt,
        category_key: newPost.category_key || 'general', // 빈 값 방지
        is_featured: newPost.is_featured !== undefined ? newPost.is_featured : true, // Home 노출 여부
        published_at: Date.now(), // epoch milliseconds
        images: tempImages.length > 0 ? tempImages : []
      };

      const { data, error } = await createPost(postData);
      if (error) throw error;

      // 임시 이미지를 영구 저장으로 이동
      if (tempImages.length > 0) {
        const movedImages = await moveToPermanent(data.id);
        
        // content의 이미지 URL을 새로운 경로로 업데이트
        if (movedImages.length > 0) {
          let updatedContent = data.content;
          tempImages.forEach((tempPath, index) => {
            if (movedImages[index]) {
              const tempUrl = `https://bimuiyejfcapaxqlgkre.supabase.co/storage/v1/object/public/blog-images/${tempPath}`;
              const newUrl = movedImages[index].url;
              updatedContent = updatedContent.replace(new RegExp(tempUrl, 'g'), newUrl);
            }
          });
          
          // 업데이트된 content로 포스트 수정
          if (updatedContent !== data.content) {
            await updatePost(data.id, { content: updatedContent });
            // posts 상태도 업데이트
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.id === data.id 
                  ? { ...post, content: updatedContent }
                  : post
              )
            );
          }
        }
      }

      // 새 포스트 생성 후 첫 페이지로 이동하여 새 포스트 확인
      setCurrentPage(1);
      // 첫 페이지를 다시 로드
      await fetchPosts();
      
      setNewPost({
        title: '',
        content: '',
        excerpt: ['', '', ''], // 초기화
        tags: [],
        category_key: 'general', // 초기화
        is_published: false,
        is_featured: true // 초기화
      });
      setTagsInput(''); // 태그 입력 필드 초기화
      
      // 이미지 상태 정리
      cleanup();
      
      showSnackbar('포스트가 생성되었습니다.', 'success');
    } catch (error) {
      showSnackbar('포스트 생성 중 오류가 발생했습니다.', 'error');
    }
  };

  // 포스트 수정
  const handleUpdatePost = async () => {
    if (!editingPost || !editingPost.title.trim()) {
      showSnackbar('제목은 필수입니다.', 'error');
      return;
    }

    try {
      // excerpt에서 빈 문자열 제거하고 최대 3개만 유지
      const cleanExcerpt = editingPost.excerpt.filter(item => item.trim()).slice(0, 3);
      
      const updateData = {
        title: editingPost.title,
        content: editingPost.content,
        excerpt: cleanExcerpt,
        tags: editingPost.tags.length > 0 ? editingPost.tags : [],
        category_key: editingPost.category_key || 'general', // 빈 값 방지
        is_published: Boolean(editingPost.is_published), // 명시적으로 boolean 변환
        is_featured: editingPost.is_featured !== undefined ? editingPost.is_featured : true, // Home 노출 여부
        images: tempImages.length > 0 ? tempImages : (editingPost.images || [])
      };

      const { error } = await updatePost(editingPost.id, updateData);
      if (error) throw error;

      // 임시 이미지를 영구 저장으로 이동
      if (tempImages.length > 0) {
        const movedImages = await moveToPermanent(editingPost.id);
        
        // content의 이미지 URL을 새로운 경로로 업데이트
        if (movedImages.length > 0) {
          let updatedContent = editingPost.content;
          tempImages.forEach((tempPath, index) => {
            if (movedImages[index]) {
              const tempUrl = `https://bimuiyejfcapaxqlgkre.supabase.co/storage/v1/object/public/blog-images/${tempPath}`;
              const newUrl = movedImages[index].url;
              updatedContent = updatedContent.replace(new RegExp(tempUrl, 'g'), newUrl);
            }
          });
          
          // 업데이트된 content로 포스트 수정
          if (updatedContent !== editingPost.content) {
            await updatePost(editingPost.id, { content: updatedContent });
            // posts 상태도 업데이트
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.id === editingPost.id 
                  ? { ...post, content: updatedContent }
                  : post
              )
            );
          }
        }
      }

      // 포스트 수정 후 현재 페이지 다시 로드
      await fetchPosts();
      
      setEditingPost(null);
      setEditingTagsInput(''); // 태그 입력 필드 초기화
      setOpenDialog(false);
      
      // 이미지 상태 정리
      cleanup();
      
      showSnackbar('포스트가 수정되었습니다.', 'success');
    } catch (error) {
      showSnackbar('포스트 수정 중 오류가 발생했습니다.', 'error');
    }
  };

  // 포스트 삭제
  const handleDeletePost = async (id) => {
    if (!window.confirm('정말로 이 포스트를 삭제하시겠습니까?')) return;

    try {
      const { error } = await deletePost(id);
      if (error) throw error;

      // 삭제 후 현재 페이지 다시 로드
      await fetchPosts();
      showSnackbar('포스트가 삭제되었습니다.', 'success');
    } catch (error) {
      showSnackbar('포스트 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 발행 상태 변경
  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const { error } = await togglePostPublish(id, !currentStatus);
      if (error) throw error;

      // 상태 변경 후 현재 페이지 다시 로드
      await fetchPosts();
      showSnackbar(`포스트가 ${!currentStatus ? '발행' : '임시저장'}되었습니다.`, 'success');
    } catch (error) {
      showSnackbar('상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  // 태그 입력 처리 - 입력 문자열만 저장
  const handleTagsChange = (tagsString) => {
    setTagsInput(tagsString);
    // 배열로 변환하여 tags에도 저장 (실시간 미리보기용)
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setNewPost({ ...newPost, tags });
  };

  const handleEditTagsChange = (tagsString) => {
    setEditingTagsInput(tagsString);
    // 배열로 변환하여 tags에도 저장 (실시간 미리보기용)
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setEditingPost({ ...editingPost, tags });
  };

  // excerpt 입력 처리 (배열)
  const handleExcerptChange = (index, value) => {
    const newExcerpt = [...newPost.excerpt];
    newExcerpt[index] = value;
    setNewPost({ ...newPost, excerpt: newExcerpt });
  };

  const handleEditExcerptChange = (index, value) => {
    const newExcerpt = [...editingPost.excerpt];
    newExcerpt[index] = value;
    setEditingPost({ ...editingPost, excerpt: newExcerpt });
  };

  // 마크다운 에디터 이벤트 처리
  const handleEditorPaste = async (event) => {
    const imageUrl = await handlePasteImage(event);
    if (imageUrl) {
      // 에디터에 이미지 삽입 (커서 위치)
      const imageMarkdown = `![이미지](${imageUrl})`;
      return imageMarkdown;
    }
  };

  const handleEditorDrop = async (event) => {
    const imageUrls = await handleDropImage(event);
    if (imageUrls.length > 0) {
      // 첫 번째 이미지에 대해 크기 조절 다이얼로그 표시
      setImageSizeDialog({
        open: true,
        imageUrl: imageUrls[0],
        width: 'auto',
        height: 'auto'
      });
      
      // MDEditor의 내장 기능을 활용하여 커서 위치에 삽입
      return `![이미지](${imageUrls[0]})`;
    }
  };

  // 수정 다이얼로그용 드롭 핸들러
  const handleEditEditorDrop = async (event) => {
    const imageUrls = await handleDropImage(event);
    if (imageUrls.length > 0) {
      // 첫 번째 이미지에 대해 크기 조절 다이얼로그 표시
      setImageSizeDialog({
        open: true,
        imageUrl: imageUrls[0],
        width: 'auto',
        height: 'auto'
      });
      
      // MDEditor의 내장 기능을 활용하여 커서 위치에 삽입
      return `![이미지](${imageUrls[0]})`;
    }
  };

  // 이미지 크기 조절을 위한 HTML 태그 생성
  const createImageWithSize = (url, width = 'auto', height = 'auto') => {
    return `<img src="${url}" alt="이미지" style="width: ${width}; max-width: 100%; object-fit: contain;" />`;
  };

  // 이미지 크기 조절 다이얼로그
  const [imageSizeDialog, setImageSizeDialog] = useState({
    open: false,
    imageUrl: '',
    width: 'auto',
    height: 'auto'
  });

  const handleImageSizeChange = () => {
    const { imageUrl, width, height } = imageSizeDialog;
    const imageHtml = createImageWithSize(imageUrl, width, height);
    
    // 커서 위치에 이미지 HTML 삽입
    if (editingPost) {
      // 수정 다이얼로그에서 편집 중인 경우
      const currentContent = editingPost.content;
      const before = currentContent.substring(0, cursorPosition);
      const after = currentContent.substring(cursorPosition);
      const newContent = before + '\n' + imageHtml + '\n' + after;
      setEditingPost({ ...editingPost, content: newContent });
    } else {
      // 새 포스트 작성 중인 경우
      const currentContent = newPost.content;
      const before = currentContent.substring(0, cursorPosition);
      const after = currentContent.substring(cursorPosition);
      const newContent = before + '\n' + imageHtml + '\n' + after;
      setNewPost({ ...newPost, content: newContent });
    }
    
    setImageSizeDialog({ open: false, imageUrl: '', width: 'auto', height: 'auto' });
  };

  // 날짜 포맷팅 (epoch milliseconds -> 읽기 쉬운 형태)
  const formatDate = (timestamp) => {
    if (!timestamp) return '날짜 없음';
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 스낵바 표시
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // 카테고리 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getAllCategories();
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('카테고리 조회 중 오류:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 페이지 변경 핸들러
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setHighlightedPostId(null); // 페이지 변경 시 하이라이트 제거
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  // 로그아웃 처리
  const handleLogout = async () => {
    
    try {
      // 🔥 먼저 홈페이지로 이동 (ProtectedRoute가 리다이렉트하기 전에)
      // BrowserRouter 전환 이후 해시(#/)는 단순 프래그먼트일 뿐 실제 네비게이션을
      // 일으키지 않으므로, react-router의 navigate로 실제 이동시킨다.
      navigate('/');

      const { error } = await signOut();
      if (error) {
        showSnackbar('로그아웃 중 오류가 발생했습니다.', 'error');
      } else {

      }
    } catch (error) {
      showSnackbar('로그아웃 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          포스트 관리
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          <IconButton 
            onClick={handleLogout}
            sx={{ 
              color: '#000000',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 이미지 업로드 진행률 */}
      {uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            이미지 업로드 중...
          </Typography>
        </Box>
      )}

      {/* 임시 이미지 상태 표시 */}
      {tempImages.length > 0 && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="body2" color="warning.contrastText">
            임시 이미지 {tempImages.length}개 - 포스트 저장 시 영구 저장됩니다
          </Typography>
        </Box>
      )}

      {/* 새 포스트 생성 */}
      <Box sx={{ mb: 4, p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          새 포스트 작성 (다음 ID: {getNextId()})
        </Typography>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr 1fr' }}>
          <FormControl fullWidth>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={newPost.category_key || 'general'}
              onChange={(e) => setNewPost({ ...newPost, category_key: e.target.value })}
              label="카테고리"
            >
              {categories.map((category) => (
                <MenuItem key={category.key} value={category.key}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="제목"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            placeholder="포스트 제목"
          />
          <TextField
            label="태그 (쉼표로 구분)"
            value={tagsInput}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Java, Spring Boot, Backend"
            fullWidth
          />
        </Box>
        
        {/* Excerpt 입력 (배열) */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            요약 (최대 3개)
          </Typography>
          {[0, 1, 2].map((index) => (
            <TextField
              key={index}
              label={`요약 ${index + 1}`}
              value={newPost.excerpt[index] || ''}
              onChange={(e) => handleExcerptChange(index, e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 1 }}
              placeholder={index === 0 ? "첫 번째 요약" : index === 1 ? "두 번째 요약" : "세 번째 요약"}
            />
          ))}
        </Box>

        {/* 마크다운 에디터 */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            내용 (마크다운) - 이미지 붙여넣기(Ctrl+V) 또는 드래그 앤 드롭 지원
          </Typography>
          <div data-color-mode="light">
            <MDEditor
              value={newPost.content}
              onChange={(value, event) => {
                setNewPost({ ...newPost, content: value || '' });
                // 커서 위치 추적
                if (event && event.target) {
                  setCursorPosition(event.target.selectionStart || 0);
                }
              }}
              height={300}
              preview="live"
              onPaste={handleEditorPaste}
              onDrop={handleEditorDrop}
              onSelect={(event) => {
                // 커서 위치 실시간 추적
                setCursorPosition(event.target.selectionStart || 0);
              }}
            />
          </div>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Switch
                checked={newPost.is_published}
                onChange={(e) => setNewPost({ ...newPost, is_published: e.target.checked })}
              />
            }
            label="즉시 발행"
          />
          <FormControlLabel
            control={
              <Switch
                checked={newPost.is_featured !== undefined ? newPost.is_featured : true}
                onChange={(e) => setNewPost({ ...newPost, is_featured: e.target.checked })}
              />
            }
            label="Home 노출"
          />
          <Button 
            variant="contained" 
            onClick={handleCreatePost}
            disabled={!newPost.title.trim() || uploading}
          >
            포스트 생성
          </Button>
        </Box>
      </Box>

      {/* 포스트 목록 */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            포스트 목록 (전체 {totalCount}개)
        </Typography>
          
          {/* 포스트 번호로 조회 */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="포스트 번호로 조회"
              value={postIdSearch}
              onChange={(e) => setPostIdSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchByPostId();
                }
              }}
              size="small"
              sx={{ width: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="예: 29"
            />
            <Button
              variant="outlined"
              onClick={handleSearchByPostId}
              size="small"
            >
              조회
            </Button>
          </Box>
        </Box>
        <List>
          {posts.map((post) => (
            <ListItem
              key={post.id}
              id={`post-${post.id}`}
              sx={{ 
                border: highlightedPostId === post.id ? '3px solid #1976d2' : '1px solid #eee',
                mb: 1, 
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: highlightedPostId === post.id ? '#e3f2fd' : 'transparent',
                transition: 'all 0.3s ease',
                animation: highlightedPostId === post.id ? 'pulse 0.5s ease-in-out' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.02)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6">{post.title}</Typography>
                  <Chip 
                    label={post.is_published ? '발행됨' : '임시저장'} 
                    color={post.is_published ? 'success' : 'default'}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    ID: {post.id}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {Array.isArray(post.excerpt) && post.excerpt.length > 0 
                    ? post.excerpt.filter(item => item.trim()).join(' | ')
                    : '요약 없음'
                  }
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {post.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  조회수: {post.view_count} | 생성일: {formatDate(post.created_at)}
                  {post.published_at && ` | 발행일: ${formatDate(post.published_at)}`}
                </Typography>
                {/* 이미지 표시 */}
                {post.images && post.images.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      이미지: {post.images.length}개
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={() => {
                    setEditingPost({
                      ...post,
                      category_key: post.category_key || 'general',
                      is_published: post.is_published === true, // boolean으로 명시적 변환
                      is_featured: post.is_featured !== undefined ? post.is_featured : true,
                      excerpt: Array.isArray(post.excerpt) ? [...post.excerpt, '', '', ''].slice(0, 3) : ['', '', '']
                    });
                    setEditingTagsInput(Array.isArray(post.tags) ? post.tags.join(', ') : ''); // 태그 입력 필드 초기화
                    setOpenDialog(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleTogglePublish(post.id, post.is_published)}
                >
                  {post.is_published ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
                <IconButton 
                  onClick={() => handleDeletePost(post.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>

        {/* 페이지네이션 */}
        {!loading && posts.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
            <Pagination
              count={Math.ceil(totalCount / POSTS_PER_PAGE)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>

      {/* 수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>포스트 수정</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr 1fr', mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={editingPost?.category_key || 'general'}
                onChange={(e) => setEditingPost({ ...editingPost, category_key: e.target.value })}
                label="카테고리"
              >
                {categories.map((category) => (
                  <MenuItem key={category.key} value={category.key}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="제목"
              value={editingPost?.title || ''}
              onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
            />
            <TextField
              label="태그 (쉼표로 구분)"
              value={editingTagsInput}
              onChange={(e) => handleEditTagsChange(e.target.value)}
              fullWidth
            />
          </Box>
          
          {/* Excerpt 수정 (배열) */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              요약 (최대 3개)
            </Typography>
            {[0, 1, 2].map((index) => (
              <TextField
                key={index}
                label={`요약 ${index + 1}`}
                value={editingPost?.excerpt?.[index] || ''}
                onChange={(e) => handleEditExcerptChange(index, e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
                placeholder={index === 0 ? "첫 번째 요약" : index === 1 ? "두 번째 요약" : "세 번째 요약"}
              />
            ))}
          </Box>

          {/* 마크다운 에디터 (수정) */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              내용 (마크다운) - 이미지 붙여넣기(Ctrl+V) 또는 드래그 앤 드롭 지원
            </Typography>
            <div data-color-mode="light">
              <MDEditor
                value={editingPost?.content || ''}
                onChange={(value, event) => {
                  setEditingPost({ ...editingPost, content: value || '' });
                  // 커서 위치 추적
                  if (event && event.target) {
                    setCursorPosition(event.target.selectionStart || 0);
                  }
                }}
                height={400}
                preview="live"
                onPaste={handleEditorPaste}
                onDrop={handleEditEditorDrop}
                onSelect={(event) => {
                  // 커서 위치 실시간 추적
                  setCursorPosition(event.target.selectionStart || 0);
                }}
              />
            </div>
          </Box>

          {/* 발행 및 Home 노출 설정 */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(editingPost?.is_published)}
                  onChange={(e) => {
                    setEditingPost({ ...editingPost, is_published: Boolean(e.target.checked) });
                  }}
                />
              }
              label="발행"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editingPost?.is_featured !== undefined ? editingPost.is_featured : true}
                  onChange={(e) => setEditingPost({ ...editingPost, is_featured: e.target.checked })}
                />
              }
              label="Home 노출"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button 
            onClick={handleUpdatePost} 
            variant="contained"
            disabled={uploading}
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 이미지 크기 조절 다이얼로그 */}
      <Dialog open={imageSizeDialog.open} onClose={() => setImageSizeDialog({ ...imageSizeDialog, open: false })}>
        <DialogTitle>이미지 크기 설정</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              이미지 크기를 설정하세요. 'auto'로 설정하면 원본 크기가 유지됩니다.
            </Typography>
            
            <TextField
              label="너비"
              value={imageSizeDialog.width}
              onChange={(e) => setImageSizeDialog({ ...imageSizeDialog, width: e.target.value })}
              placeholder="예: 300px, 50%, auto"
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="높이"
              value={imageSizeDialog.height}
              onChange={(e) => setImageSizeDialog({ ...imageSizeDialog, height: e.target.value })}
              placeholder="예: 200px, 50%, auto"
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <Typography variant="caption" color="text.secondary">
              예시: 300px, 50%, auto, 100vw (뷰포트 너비)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageSizeDialog({ ...imageSizeDialog, open: false })}>
            취소
          </Button>
          <Button onClick={handleImageSizeChange} variant="contained">
            삽입
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostManager;
