import React from 'react';
import { Box, Typography } from '@mui/material';
import { getVisibleCategories } from '../getVisibleCategories';
import { getAreaColor, ACCENT } from '../listTheme';
import { getSidebarTags } from '../tagCounts';

const TECH_DOT_COLOR = '#9ca3af';

const groupTitleSx = {
  fontSize: 11,
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
  p: '6px 8px',
  border: 0,
  borderRadius: '6px',
  font: 'inherit',
  fontSize: 13,
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
    <Box component="span" sx={{ ml: 'auto', fontSize: 11, color: '#6b7280', fontWeight: 400 }}>
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
}) => {
  const visibleCategories = getVisibleCategories(categories, categoryCounts, selectedCategoryKey);
  const sidebarTags = getSidebarTags(tagCounts, selectedTags);

  return (
    <Box
      component="nav"
      aria-label="글 필터"
      sx={{
        width: { xs: '100%', md: 230 },
        flex: 'none',
        backgroundColor: '#f8f9fb',
        borderRight: { md: '1px solid #e5e7eb' },
        borderBottom: { xs: '1px solid #e5e7eb', md: 0 },
        p: '16px 12px',
        '@media (max-width:760px)': { width: '100%', borderRight: 0, borderBottom: '1px solid #e5e7eb' },
      }}
    >
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
  );
};

export default BlogListSidebar;
