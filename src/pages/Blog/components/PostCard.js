import React from 'react';
import { Box, Typography } from '@mui/material';
import { getAreaColor, TAG_PILL } from '../listTheme';
import { formatPostDate } from '../formatPostDate';

export const MAX_CARD_TAGS = 3;

const EXCERPT_FALLBACK_LENGTH = 150;
const EXCERPT_MAX_LINES = 3;

/** 카드에 보일 요약 줄. 요약이 비어 있으면 본문 앞부분으로 대체한다. */
export const getExcerptLines = (post) => {
  const lines = Array.isArray(post.excerpt) ? post.excerpt.filter((item) => item && item.trim()) : [];
  if (lines.length > 0) return lines;
  if (!post.content) return [];
  return [post.content.substring(0, EXCERPT_FALLBACK_LENGTH) + '...'];
};

const pillSx = (colors) => ({
  display: 'inline-block',
  flex: 'none',
  fontSize: 11,
  lineHeight: 1.6,
  padding: '2px 9px',
  borderRadius: 999,
  color: colors.color,
  backgroundColor: colors.bg,
  whiteSpace: 'nowrap',
});

const PostCard = ({ post, categoryName, onClick, onTagClick }) => {
  const area = getAreaColor(post.category_key);
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const hiddenTagCount = tags.length - MAX_CARD_TAGS;
  const excerptLines = getExcerptLines(post);

  return (
    <Box
      role="link"
      tabIndex={0}
      onClick={() => onClick(post)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onClick(post);
      }}
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        p: '14px 16px',
        cursor: 'pointer',
        backgroundColor: '#ffffff',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.12)', transform: 'translateY(-1px)' },
        '&:focus-visible': { outline: '2px solid #4f46e5', outlineOffset: 2 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '6px', overflow: 'hidden' }}>
        <Box component="span" sx={{ ...pillSx(area), fontWeight: 700 }}>
          {categoryName}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
          {tags.slice(0, MAX_CARD_TAGS).map((tag) => (
            <Box
              component="span"
              key={tag}
              onClick={(event) => {
                event.stopPropagation();
                onTagClick(tag);
              }}
              sx={{ ...pillSx(TAG_PILL), cursor: 'pointer' }}
            >
              {tag}
            </Box>
          ))}
          {hiddenTagCount > 0 && (
            <Box component="span" sx={pillSx(TAG_PILL)}>{`+${hiddenTagCount}`}</Box>
          )}
        </Box>
        <Typography component="span" sx={{ ml: 'auto', flex: 'none', fontSize: 12, color: '#6b7280' }}>
          {formatPostDate(post.published_at)}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, textWrap: 'balance', wordBreak: 'keep-all' }}>
        {post.title}
      </Typography>

      {excerptLines.length > 0 && (
        <Box
          sx={{
            mt: '8px',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: EXCERPT_MAX_LINES,
            overflow: 'hidden',
          }}
        >
          {excerptLines.map((line, index) => (
            <Typography key={index} sx={{ fontSize: 13, lineHeight: 1.6, color: '#4b5563', wordBreak: 'keep-all' }}>
              {line}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PostCard;
