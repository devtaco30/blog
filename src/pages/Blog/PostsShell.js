import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import BlogListSidebar, { SIDEBAR_TOGGLE_DURATION } from './components/BlogListSidebar';
import SidebarToggleButton from './components/SidebarToggleButton';
import { useListSidebarData } from './useListSidebarData';
import { useSidebarOpen } from './useSidebarOpen';
import { useHeaderSlot } from '../../components/layout/headerSlot';

const SidebarContext = createContext(null);

// 사이드바 + 본문 + 목차를 합친 전체 폭의 상한
const SHELL_MAX_WIDTH = 1440;
// 본문 왼쪽 여백(기본)
const MAIN_PADDING_LEFT = 32;
// 사이드바가 닫혔을 때 본문 글자가 시작해야 하는 최소 위치.
// 왼쪽 위 버튼(☰, 사이드바 열기)이 화면 왼쪽 20px부터 32px 폭으로 놓여 52px에서 끝나고, 거기서 20px를 띄운다.
const CLOSED_MIN_CONTENT_LEFT = 72;
// 틀은 화면 가운데 놓이므로 본문 글자 시작점 = 틀 바깥 여백((창 폭 - 1440) / 2, 창이 더 좁으면 0) + 본문 왼쪽 여백.
// 닫힌 상태에서는 이 값이 72px 이상이 되도록 모자란 만큼만 왼쪽 여백을 늘린다.
// 창이 1520px 이상이면 32px 그대로이고, 좁아질수록 조금씩 늘어나 경계에서 본문이 튀지 않는다.
const CLOSED_PADDING_LEFT = `max(${MAIN_PADDING_LEFT}px, calc(${CLOSED_MIN_CONTENT_LEFT}px - max(0px, (100vw - ${SHELL_MAX_WIDTH}px) / 2)))`;

// 여닫기 버튼(☰ 아래 열기, 사이드바 안 닫기)이 나타나는 시간과 사라지는 시간
const BUTTON_FADE_IN_DURATION = '0.3s';
const BUTTON_FADE_OUT_DURATION = '0.15s';

// 사이드바가 다 열리고 닫힌 뒤에 버튼이 서서히 나타나게 하는 스타일
const FADE_IN_AFTER_TOGGLE_SX = {
  animation: `sidebarButtonFadeIn ${BUTTON_FADE_IN_DURATION} ease ${SIDEBAR_TOGGLE_DURATION} both`,
  '@keyframes sidebarButtonFadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

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
  const { isSidebarOpen, toggleSidebar } = useSidebarOpen();
  const headerSlot = useHeaderSlot();
  const closeButtonRef = useRef(null);
  const openButtonRef = useRef(null);
  const toggledByUserRef = useRef(false);
  const hasToggledRef = useRef(false);

  const handleToggleSidebar = useCallback(() => {
    toggledByUserRef.current = true;
    hasToggledRef.current = true;
    toggleSidebar();
  }, [toggleSidebar]);

  // 누른 버튼은 상태가 바뀌면 사라지므로, 키보드 포커스를 반대편 버튼으로 옮긴다. 처음 그릴 때는 옮기지 않는다.
  useEffect(() => {
    if (!toggledByUserRef.current) return;
    toggledByUserRef.current = false;
    const target = isSidebarOpen ? closeButtonRef.current : openButtonRef.current;
    if (target) target.focus();
  }, [isSidebarOpen]);

  const updateSelection = useCallback((categoryKey, tags) => {
    setSelection((previous) => {
      const nextCategoryKey = categoryKey === null ? previous.categoryKey : categoryKey;
      const sameTags = previous.tags.length === tags.length && previous.tags.every((tag, index) => tag === tags[index]);
      if (nextCategoryKey === previous.categoryKey && sameTags) return previous;
      return { categoryKey: nextCategoryKey, tags: sameTags ? previous.tags : tags };
    });
  }, []);

  const contextValue = useMemo(
    () => ({ data, updateSelection, handlersRef, isSidebarOpen }),
    [data, updateSelection, isSidebarOpen]
  );

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
          isOpen={isSidebarOpen}
          closeButton={
            isSidebarOpen && (
              <SidebarToggleButton
                ref={closeButtonRef}
                isOpen
                onClick={handleToggleSidebar}
                // 사용자가 연 경우에만, 사이드바가 다 열린 뒤에 서서히 나타나게 한다.
                // (☰ 아래 열기 버튼이 사라지자마자 사이드바 끝에 같은 버튼이 보이지 않게. 처음 들어올 때는 바로 보인다.)
                sx={hasToggledRef.current ? FADE_IN_AFTER_TOGGLE_SX : undefined}
              />
            )
          }
        />
        {/* 목록과 상세가 같은 왼쪽·오른쪽 끝을 쓰도록 본문 여백은 여기서 한 번만 정한다 */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, md: `76px 24px 32px ${MAIN_PADDING_LEFT}px` },
            transition: 'padding-left 0.2s ease',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            // 사이드바가 닫혀 있으면, 왼쪽 위 버튼이 놓이는 세로 줄을 본문이 비우도록 왼쪽 여백을 정한다.
            // (760px 이하에서는 버튼을 숨기고 사이드바를 본문 위에 보여 주므로 적용하지 않는다.)
            ...(!isSidebarOpen && {
              '@media (min-width:761px)': { paddingLeft: CLOSED_PADDING_LEFT },
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
      {/* 열기 버튼은 화면 왼쪽 위 ☰ 바로 아래 자리(Layout)에 늘 그려 두고, 투명도로 나타나고 사라지게 한다.
          닫힐 때: 사이드바가 다 닫힌 뒤에 서서히 나타난다 (버튼이 갑자기 다른 곳에 튀어나오지 않게).
          열릴 때: 서서히 사라진 뒤 감춘다 (화면낭독기와 Tab 이동에서도 빠진다). */}
      {headerSlot &&
        createPortal(
          <SidebarToggleButton
            ref={openButtonRef}
            isOpen={false}
            onClick={handleToggleSidebar}
            sx={{
              ...(isSidebarOpen
                ? {
                    opacity: 0,
                    visibility: 'hidden',
                    transition: `opacity ${BUTTON_FADE_OUT_DURATION} ease, visibility 0s linear ${BUTTON_FADE_OUT_DURATION}`,
                  }
                : {
                    // 닫은 직후 이 버튼으로 포커스를 옮기므로 visibility는 바로 보이게 두고 투명도만 늦춘다.
                    opacity: 1,
                    visibility: 'visible',
                    transition: `opacity ${BUTTON_FADE_IN_DURATION} ease ${SIDEBAR_TOGGLE_DURATION}`,
                  }),
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              '@media (max-width:760px)': { display: 'none' },
            }}
          />,
          headerSlot
        )}
    </SidebarContext.Provider>
  );
};

/** 사이드바 데이터(영역 목록, 영역별 개수, 태그별 개수). 틀 안의 페이지에서 쓴다. */
export const useSidebarData = () => useContext(SidebarContext).data;

/** 사이드바가 열려 있는지. 글 상세가 본문 폭을 정할 때 쓴다. */
export const useIsSidebarOpen = () => useContext(SidebarContext).isSidebarOpen;

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
