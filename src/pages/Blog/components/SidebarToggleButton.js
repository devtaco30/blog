import React, { forwardRef } from 'react';
import { IconButton } from '@mui/material';
import { PanelLeftIcon, HEADER_ICON_BUTTON_SX } from '../../../components/ui/headerIcons';

/**
 * 사이드바를 여닫는 버튼. 열려 있으면 사이드바 안 오른쪽 위에, 닫혀 있으면 ☰ 바로 아래에 그려진다.
 * 모양은 ☰ 버튼(Layout)과 같게 맞춘다 (배경 없는 32px 버튼, 얇은 선 아이콘).
 */
const SidebarToggleButton = forwardRef(({ isOpen, onClick, sx }, ref) => (
  <IconButton
    ref={ref}
    onClick={onClick}
    aria-label={isOpen ? '사이드바 닫기' : '사이드바 열기'}
    aria-expanded={isOpen}
    aria-controls="posts-sidebar"
    sx={{ ...HEADER_ICON_BUTTON_SX, ...sx }}
  >
    <PanelLeftIcon />
  </IconButton>
));

export default SidebarToggleButton;
