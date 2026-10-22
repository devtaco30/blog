import React from 'react';
import { Box } from '@mui/material';

/**
 * 글 본문의 코드 블록. 위에 언어 이름, 왼쪽에 줄 번호를 보여 준다.
 * 줄 번호는 드래그해서 복사할 때 따라오지 않게 선택을 막는다.
 */
const CodeBlock = ({ language, code }) => {
  const lines = code.replace(/\n$/, '').split('\n');

  return (
    <Box
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        overflow: 'hidden',
        mb: 3,
        backgroundColor: '#f8f9fb',
        fontFamily: '"SF Mono", Menlo, Consolas, monospace',
      }}
    >
      <Box sx={{ px: 2, py: '6px', fontSize: 11, letterSpacing: '0.06em', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
        {language ? language.toUpperCase() : 'TEXT'}
      </Box>
      <Box component="pre" sx={{ m: 0, p: '12px 0', overflowX: 'auto', fontSize: 13, lineHeight: 1.7, backgroundColor: 'transparent' }}>
        <Box component="code" sx={{ display: 'block', minWidth: 'max-content', backgroundColor: 'transparent', p: 0 }}>
          {lines.map((line, index) => (
            <Box key={index} sx={{ display: 'flex' }}>
              <Box
                component="span"
                sx={{ flex: 'none', width: 44, pr: 2, textAlign: 'right', color: '#9ca3af', userSelect: 'none' }}
              >
                {index + 1}
              </Box>
              <Box component="span" sx={{ whiteSpace: 'pre', pr: 2 }}>
                {line}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CodeBlock;
