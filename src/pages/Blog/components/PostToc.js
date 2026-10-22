import React from 'react';
import { Box, Typography } from '@mui/material';
import { ACCENT } from '../listTheme';

/**
 * 글 오른쪽에 따라다니는 목차 카드. 소제목(h2, h3)에서 자동으로 만든다.
 * @param {{headings: Array<{id: string, text: string, level: 2 | 3}>, activeId: string}} props
 */
const PostToc = ({ headings, activeId }) => {
  if (headings.length === 0) return null;

  const handleClick = (event, id) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      component="nav"
      aria-label="목차"
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        backgroundColor: '#f8f9fb',
        p: '14px 12px',
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto',
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6b7280', mx: 1, mb: 1 }}>목차</Typography>
      {headings.map(({ id, text, level }) => {
        const active = id === activeId;
        return (
          <Box
            component="a"
            key={id}
            href={`#${id}`}
            aria-current={active ? 'true' : undefined}
            onClick={(event) => handleClick(event, id)}
            sx={{
              display: 'block',
              p: '5px 8px',
              pl: level === 3 ? '20px' : '8px',
              borderRadius: '6px',
              fontSize: 13,
              lineHeight: 1.45,
              textDecoration: 'none',
              wordBreak: 'keep-all',
              color: active ? ACCENT.main : '#4b5563',
              fontWeight: active ? 700 : 400,
              backgroundColor: active ? ACCENT.selectedBg : 'transparent',
              '&:hover': { backgroundColor: active ? ACCENT.selectedBg : '#eef0f3' },
            }}
          >
            {text}
          </Box>
        );
      })}
    </Box>
  );
};

export default PostToc;
