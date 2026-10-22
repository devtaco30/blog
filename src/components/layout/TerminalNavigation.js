import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// 목록 페이지와 같은 인디고 계열. 검정 배경 위에서 읽히도록 #4f46e5보다 밝게 잡았다.
const TERMINAL_ACCENT_COLOR = '#818cf8';

const TerminalNavigation = ({ terminalOpen, closeTerminal, handleNavigationClick }) => {
  return (
    <Box data-testid="terminal-navigation" sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#000000',
      color: TERMINAL_ACCENT_COLOR,
      fontFamily: 'monospace',
      fontSize: '0.9rem',
      padding: 2,
      borderTop: `2px solid ${TERMINAL_ACCENT_COLOR}`,
      zIndex: 1000,
      transform: terminalOpen ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.3s ease'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ color: TERMINAL_ACCENT_COLOR, fontFamily: 'monospace' }}>
          devjack@portfolio:~$ navigation
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#666666', fontFamily: 'monospace', fontSize: '0.8rem' }}>
            ⌘M to close
          </Typography>
          <IconButton 
            onClick={closeTerminal}
            sx={{ color: TERMINAL_ACCENT_COLOR, p: 0 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Box>
          <Typography variant="body2" sx={{ color: TERMINAL_ACCENT_COLOR, mb: 1, fontFamily: 'monospace' }}>
            Navigation:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#cccccc', 
                fontFamily: 'monospace',
                cursor: 'pointer',
                '&:hover': { color: TERMINAL_ACCENT_COLOR }
              }}
              onClick={() => handleNavigationClick('home')}
            >
              1 → home
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#cccccc', 
                fontFamily: 'monospace',
                cursor: 'pointer',
                '&:hover': { color: TERMINAL_ACCENT_COLOR }
              }}
              onClick={() => handleNavigationClick('about')}
            >
              2 → about
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#cccccc', 
                fontFamily: 'monospace',
                cursor: 'pointer',
                '&:hover': { color: TERMINAL_ACCENT_COLOR }
              }}
              onClick={() => handleNavigationClick('posts')}
            >
              3 → posts
            </Typography>

          </Box>
        </Box>
        
        <Box>
          <Typography variant="body2" sx={{ color: TERMINAL_ACCENT_COLOR, mb: 1, fontFamily: 'monospace' }}>
            External:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#cccccc', 
                fontFamily: 'monospace',
                cursor: 'pointer',
                '&:hover': { color: TERMINAL_ACCENT_COLOR }
              }}
              onClick={() => handleNavigationClick('github')}
            >
              g → github
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#cccccc', 
                fontFamily: 'monospace',
                cursor: 'pointer',
                '&:hover': { color: TERMINAL_ACCENT_COLOR }
              }}
              onClick={() => handleNavigationClick('email')}
            >
              e → email
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#cccccc', 
                fontFamily: 'monospace',
                cursor: 'pointer',
                '&:hover': { color: TERMINAL_ACCENT_COLOR }
              }}
              onClick={() => handleNavigationClick('linkedin')}
            >
              l → linkedin
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Typography variant="body2" sx={{ color: TERMINAL_ACCENT_COLOR, fontFamily: 'monospace', mt: 2, fontSize: '0.9rem', fontWeight: 'bold' }}>
        Press number keys (1,2,3) or letter keys (g,e,l) to navigate. Use {navigator.platform.includes('Mac') ? '⌘+M' : 'Ctrl+M'} to close.
      </Typography>
    </Box>
  );
};

export default TerminalNavigation;
