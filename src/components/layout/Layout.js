import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, IconButton } from '@mui/material';
import { useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TerminalNavigation from './TerminalNavigation';
import { useTerminalNavigation } from '../../hooks/useTerminalNavigation';
import VisitorCounter from '../ui/VisitorCounter';
import { ROUTES, HASH_ROUTES } from '../../constants/routes';
import { HeaderSlotContext } from './headerSlot';
import {
  MenuLineIcon,
  HEADER_ICON_BUTTON_SX,
  HEADER_ICON_COLOR_VAR,
  HEADER_ICON_COLOR,
  HEADER_ICON_DIMMED_COLOR,
} from '../ui/headerIcons';

// 본문 폭 제한(컨테이너)을 씌우지 않는 페이지. 글 목록은 사이드바를 화면 왼쪽 끝에 붙이기 위해 직접 폭을 정한다.
// /posts(글 목록)와 /posts/<id>(글 상세). 끝 슬래시는 비교 전에 뗀다.
const FULL_WIDTH_PATH_PATTERN = /^\/posts(\/[^/]+)?$/;

const Layout = ({ children }) => {
  const { terminalOpen, toggleTerminal, closeTerminal, handleNavigationClick } = useTerminalNavigation();
  const [showShortcut, setShowShortcut] = useState(true);
  // ☰ 바로 아래에 비워 둔 자리. 글 목록·상세가 사이드바를 닫았을 때 열기 버튼을 여기에 넣는다.
  const [headerSlot, setHeaderSlot] = useState(null);
  const location = useLocation();
  // GitHub Pages는 /posts를 /posts/로 돌려보내므로 끝 슬래시를 떼고 비교한다.
  const isFullWidthPage = FULL_WIDTH_PATH_PATTERN.test(location.pathname.replace(/\/+$/, ''));
  
  // 로그인 페이지에서는 네비게이션 숨김
  const isLoginPage = location.pathname === ROUTES.LOGIN || location.hash === HASH_ROUTES.LOGIN;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowShortcut(scrollY < 100); // 100px 스크롤 후 숨김
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // 스크롤을 내리면 왼쪽 위 버튼들(☰, 사이드바 여닫기) 아이콘을 연하게 한다. 흰 배경은 그대로 둔다.
    // 사이드바 안의 닫기 버튼도 같이 바뀌도록 변수를 화면 전체를 감싸는 요소에 건다.
    <div
      className="App"
      style={{ [HEADER_ICON_COLOR_VAR]: showShortcut ? HEADER_ICON_COLOR : HEADER_ICON_DIMMED_COLOR }}
    >
      {/* Top Header Icons - 로그인 페이지에서는 숨김 */}
      {!isLoginPage && (
        <Box sx={{
          position: 'fixed',
          top: 20,
          left: 20,
          right: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          // 이 줄은 화면 가로 전체를 덮는다. 빈 곳은 클릭을 통과시켜 아래 요소(사이드바 닫기 버튼 등)가 눌리게 한다.
          pointerEvents: 'none'
        }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              pointerEvents: 'auto',
            }}
          >
            <Box sx={{ position: 'relative', display: 'flex' }}>
              <IconButton 
                onClick={toggleTerminal}
                sx={HEADER_ICON_BUTTON_SX}
              >
                <MenuLineIcon />
              </IconButton>
              {/* ☰ 바로 아래 자리. 가로줄에 넣으면 본문 위로 튀어나와 글자를 가리므로 세로로 쌓는다. */}
              <Box ref={setHeaderSlot} sx={{ position: 'absolute', top: '100%', left: 0, mt: 0.5, display: 'flex' }} />
            </Box>
            {showShortcut && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.2,
                animation: 'bounce 1.5s infinite',
                '@keyframes bounce': {
                  '0%, 50%, 100%': {
                    transform: 'translateY(0)'
                  },
                  '25%, 75%': {
                    transform: 'translateY(-6px)'
                  }
                }
              }}>
                <ArrowBackIcon sx={{ 
                  fontSize: '2rem', 
                  color: 'rgba(0, 0, 0, 0.6)',
                  alignSelf: 'center'
                }} />
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontSize: '1rem',
                  color: '#666666',
                  fontFamily: '"Courier New", "Consolas", "Monaco", "Menlo", monospace',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  <span>{navigator.platform.includes('Mac') ? '⌘+M' : 'Ctrl+M'}</span>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {isFullWidthPage ? (
        <HeaderSlotContext.Provider value={headerSlot}>{children}</HeaderSlotContext.Provider>
      ) : (
        <Container 
          data-testid="page-container"
          maxWidth={false}
          sx={{
            maxWidth: {
              xs: '95%',    // 모바일: 95%
              sm: '90%',    // 작은 화면: 90%
              md: '85%',    // 중간 화면: 85%
              lg: '80%',    // 큰 화면: 80%
              xl: '75%'     // 매우 큰 화면: 75%
            },
            mx: 'auto',     // 중앙 정렬
            px: 0           // 좌우 패딩 제거하여 여백 균등화
          }}
        >
          <Grid 
            container 
            spacing={{ xs: 2, md: 3 }}
            sx={{
              maxWidth: '100%',  // Grid는 Container 내에서 전체 너비 사용
              margin: '0 auto',
              justifyContent: 'center'
            }}
          >
            {/* 메인 컨텐츠 영역 */}
            <Grid item xs={12} md={12}>
              {children}
            </Grid>
          </Grid>
        </Container>
      )}

      <footer style={{
        textAlign: 'center',
        padding: '2rem 0',
        color: '#000000',
        fontSize: '0.9rem',
        borderTop: '1px solid #000000',
        marginTop: 'auto',
        backgroundColor: '#ffffff'
      }}>
        <p>© 2025 DevJack Blog. All rights reserved.</p>
      </footer>

      {/* Hidden Visitor Counter - 화면에는 보이지 않지만 방문자 카운팅 로직 실행 */}
      <Box sx={{ display: 'none' }}>
        <VisitorCounter />
      </Box>

      {/* Terminal Navigation */}
      <TerminalNavigation 
        terminalOpen={terminalOpen}
        closeTerminal={closeTerminal}
        handleNavigationClick={handleNavigationClick}
      />
    </div>
  );
};

export default Layout; 