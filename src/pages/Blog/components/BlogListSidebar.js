import React from 'react';
import { Box, Typography } from '@mui/material';
import { getVisibleCategories } from '../getVisibleCategories';
import { getAreaColor, ACCENT } from '../listTheme';
import { getSidebarTags } from '../tagCounts';
import SidebarProfile from './SidebarProfile';
import { MOBILE_MEDIA_QUERY } from '../sidebarLayout';

const TECH_DOT_COLOR = '#9ca3af';
const SIDEBAR_WIDTH = 290;
// 사이드바가 열리고 닫히는 시간. 닫힌 뒤 나타나는 열기 버튼(PostsShell)도 이 시간만큼 기다렸다 나타난다.
export const SIDEBAR_TOGGLE_DURATION = '0.2s';
const SCROLLBAR_THUMB_COLOR = 'rgba(0, 0, 0, 0.22)';

const groupTitleSx = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: '#6b7280',
  mx: 1,
  mt: 0.5,
  mb: 1,
};

const itemSx = (selected) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  width: '100%',
  p: '8px 10px',
  border: 0,
  borderRadius: '6px',
  font: 'inherit',
  fontSize: 14,
  textAlign: 'left',
  cursor: 'pointer',
  color: selected ? ACCENT.main : '#1a1d29',
  fontWeight: selected ? 700 : 400,
  backgroundColor: selected ? ACCENT.selectedBg : 'transparent',
  '&:hover': { backgroundColor: selected ? ACCENT.selectedBg : '#eef0f3' },
  '&:focus-visible': { outline: `2px solid ${ACCENT.main}`, outlineOffset: -2 },
});

const FilterItem = ({ label, count, dotColor, selected, onClick }) => (
  <Box component="button" type="button" aria-pressed={selected} onClick={onClick} sx={itemSx(selected)}>
    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', flex: 'none', backgroundColor: dotColor }} />
    <span>{label}</span>
    <Box component="span" sx={{ ml: 'auto', fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
      {count}
    </Box>
  </Box>
);

const BlogListSidebar = ({
  categories,
  categoryCounts,
  selectedCategoryKey,
  onCategoryClick,
  tagCounts,
  selectedTags,
  onTagToggle,
  onOpenTagModal,
  isOpen = true,
  closeButton = null,
}) => {
  const visibleCategories = getVisibleCategories(categories, categoryCounts, selectedCategoryKey);
  const sidebarTags = getSidebarTags(tagCounts, selectedTags);

  return (
    <Box
      component="nav"
      id="posts-sidebar"
      aria-label="글 필터"
      sx={{
        boxSizing: 'border-box',
        // 닫으면 폭을 0으로 줄인다. 안쪽 내용은 폭이 고정이고 오른쪽 끝에 붙어 있어서,
        // 줄어드는 동안 줄바꿈되지 않고 닫기 버튼까지 통째로 왼쪽으로 밀려 나간다.
        width: isOpen ? SIDEBAR_WIDTH : 0,
        flex: 'none',
        display: 'flex',
        justifyContent: 'flex-end',
        overflowX: 'hidden',
        // 닫힌 동안에는 화면낭독기와 Tab 이동에서도 빠지게 감춘다. 닫을 때는 폭이 다 줄어든 뒤에 감춘다.
        visibility: isOpen ? 'visible' : 'hidden',
        transition: isOpen
          ? `width ${SIDEBAR_TOGGLE_DURATION} ease`
          : `width ${SIDEBAR_TOGGLE_DURATION} ease, visibility 0s linear ${SIDEBAR_TOGGLE_DURATION}`,
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        // 화면 왼쪽 끝에 붙고 본문이 스크롤돼도 따라오며, 항목이 많으면 안에서 따로 스크롤된다.
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        overflowY: 'auto',
        // 사이드바 스크롤바는 평소에는 투명하게 두고, 마우스를 사이드바 위에 올렸을 때만 얇게 보인다.
        // 폭은 늘 차지하므로 나타날 때 항목이 옆으로 밀리지 않는다.
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent',
        '&:hover': { scrollbarColor: `${SCROLLBAR_THUMB_COLOR} transparent` },
        // scrollbar-color를 지원하지 않는 Safari용
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'transparent', borderRadius: 3 },
        '&:hover::-webkit-scrollbar-thumb': { backgroundColor: SCROLLBAR_THUMB_COLOR },
        backgroundColor: '#ffffff',
        borderRight: isOpen ? '1px solid #e5e7eb' : 0,
        // 좁은 화면에서는 사이드바를 본문 위에 쌓는다. 닫은 상태는 넓은 화면과 똑같이 지킨다.
        // (세로로 쌓이면 폭을 0으로 줄여도 높이가 남으므로, 닫혀 있으면 아예 그리지 않는다.)
        [MOBILE_MEDIA_QUERY]: {
          position: 'static',
          height: 'auto',
          width: '100%',
          display: isOpen ? 'block' : 'none',
          borderRight: 0,
          borderBottom: '1px solid #e5e7eb',
        },
      }}
    >
      <Box
        sx={{
          boxSizing: 'border-box',
          position: 'relative',
          flex: 'none',
          width: SIDEBAR_WIDTH,
          // 위쪽은 화면 왼쪽 위에 떠 있는 메뉴 아이콘(⌘+M)이 차지하는 높이만큼 비운다.
          p: '76px 16px 24px 24px',
          [MOBILE_MEDIA_QUERY]: { width: '100%' },
        }}
      >
        {closeButton && (
          // 닫기 버튼은 ☰ 버튼과 같은 높이(위 20px)에, 사이드바 오른쪽 끝에 둔다.
          <Box sx={{ position: 'absolute', top: 20, right: 16 }}>
            {closeButton}
          </Box>
        )}
        <SidebarProfile />
        <Typography sx={groupTitleSx}>영역</Typography>
        {visibleCategories.map((category) => (
          <FilterItem
            key={category.key}
            label={category.name}
            count={categoryCounts[category.key] || 0}
            dotColor={category.key === 'all' ? ACCENT.main : getAreaColor(category.key).color}
            selected={selectedCategoryKey === category.key}
            onClick={() => onCategoryClick(category.key)}
          />
        ))}

        {tagCounts.length > 0 && (
          <>
            <Box sx={{ height: '1px', backgroundColor: '#e5e7eb', m: '14px 8px' }} />
            <Typography sx={groupTitleSx}>기술</Typography>
            {sidebarTags.map(({ tag, count, selected }) => (
              <FilterItem
                key={tag}
                label={tag}
                count={count}
                dotColor={TECH_DOT_COLOR}
                selected={selected}
                onClick={() => onTagToggle(tag)}
              />
            ))}
            <Box
              component="button"
              type="button"
              onClick={onOpenTagModal}
              sx={{ ...itemSx(false), color: ACCENT.main, mt: 0.5 }}
            >
              전체 보기
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default BlogListSidebar;
