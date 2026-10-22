import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import BlogListSidebar from './components/BlogListSidebar';
import { useListSidebarData } from './useListSidebarData';

const SidebarContext = createContext(null);

// 사이드바 + 본문 + 목차를 합친 전체 폭의 상한
const SHELL_MAX_WIDTH = 1440;

const EMPTY_TAGS = [];
const NO_HANDLERS = {};

/**
 * 글 목록(/posts)과 글 상세(/posts/:id)가 함께 쓰는 틀.
 * 사이드바와 그 데이터(영역, 개수, 태그)를 한 번만 만들어서, 두 페이지 사이를 오가도
 * 사이드바가 새로 그려지지 않고 데이터도 다시 불러오지 않는다. 페이지는 Outlet 자리에 그려진다.
 */
const PostsShell = () => {
  const data = useListSidebarData();
  const [selection, setSelection] = useState({ categoryKey: 'all', tags: EMPTY_TAGS });
  const handlersRef = useRef(NO_HANDLERS);

  const updateSelection = useCallback((categoryKey, tags) => {
    setSelection((previous) => {
      const nextCategoryKey = categoryKey === null ? previous.categoryKey : categoryKey;
      const sameTags = previous.tags.length === tags.length && previous.tags.every((tag, index) => tag === tags[index]);
      if (nextCategoryKey === previous.categoryKey && sameTags) return previous;
      return { categoryKey: nextCategoryKey, tags: sameTags ? previous.tags : tags };
    });
  }, []);

  const contextValue = useMemo(() => ({ data, updateSelection, handlersRef }), [data, updateSelection]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* 사이드바와 본문(과 글 상세의 목차)이 한 덩어리로 화면 가운데에 놓인다. 목록과 상세에서 위치가 같다. */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          width: '100%',
          maxWidth: SHELL_MAX_WIDTH,
          mx: 'auto',
          minHeight: '100vh',
          '@media (max-width:760px)': { flexDirection: 'column', alignItems: 'stretch' },
        }}
      >
        <BlogListSidebar
          categories={data.categories}
          categoryCounts={data.categoryCounts}
          selectedCategoryKey={selection.categoryKey}
          onCategoryClick={(key) => handlersRef.current.onCategoryClick && handlersRef.current.onCategoryClick(key)}
          tagCounts={data.tagCounts}
          selectedTags={selection.tags}
          onTagToggle={(tag) => handlersRef.current.onTagToggle && handlersRef.current.onTagToggle(tag)}
          onOpenTagModal={() => handlersRef.current.onOpenTagModal && handlersRef.current.onOpenTagModal()}
        />
        {/* 목록과 상세가 같은 왼쪽·오른쪽 끝을 쓰도록 본문 여백은 여기서 한 번만 정한다 */}
        <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: '32px 24px 32px 32px' } }}>
          <Outlet />
        </Box>
      </Box>
    </SidebarContext.Provider>
  );
};

/** 사이드바 데이터(영역 목록, 영역별 개수, 태그별 개수). 틀 안의 페이지에서 쓴다. */
export const useSidebarData = () => useContext(SidebarContext).data;

/**
 * 지금 페이지가 사이드바에 알릴 것: 선택 상태와 항목을 눌렀을 때의 동작.
 * selectedCategoryKey가 null이면(예: 글을 아직 불러오는 중) 이전 영역 선택을 그대로 둔다.
 */
export const useSidebarRegistration = ({ selectedCategoryKey, selectedTags, onCategoryClick, onTagToggle, onOpenTagModal }) => {
  const { updateSelection, handlersRef } = useContext(SidebarContext);
  const tagsKey = selectedTags.join('\u0001');

  useEffect(() => {
    updateSelection(selectedCategoryKey, selectedTags);
    // selectedTags는 tagsKey로 비교한다 (매 렌더 새 배열이어도 다시 등록하지 않기 위해)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryKey, tagsKey, updateSelection]);

  // 항목을 눌렀을 때는 항상 가장 최근 렌더의 동작을 쓴다.
  useEffect(() => {
    handlersRef.current = { onCategoryClick, onTagToggle, onOpenTagModal };
  });
};

export default PostsShell;
