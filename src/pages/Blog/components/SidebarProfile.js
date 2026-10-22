import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { ACCENT } from '../listTheme';

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/devtaco30', Icon: GitHubIcon, external: true },
  { label: '이메일', href: 'mailto:devtaco@naver.com', Icon: EmailIcon, external: false },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jonghyuk-park-02b1a1203', Icon: LinkedInIcon, external: true },
];

const AVATAR_SIZE = 40;

const SidebarProfile = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 1,
      pb: 1.5,
      mb: 1.5,
      borderBottom: '1px solid #e5e7eb',
    }}
  >
    <Box
      sx={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        flex: 'none',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: ACCENT.selectedBg,
      }}
    >
      {/* 홈 화면에서 쓰던 프로필 사진을 얼굴이 원 안에 들어오도록 확대해서 보여 준다 */}
      <img
        src={`${process.env.PUBLIC_URL}/images/profile/profile.png`}
        alt="DevJack 프로필"
        style={{ width: '180%', height: '180%', objectFit: 'cover', transform: 'translate(-1%, 23%)' }}
      />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: '#1a1d29' }}>DevJack</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
        <Box
          component={RouterLink}
          to="/about"
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: ACCENT.main,
            textDecoration: 'none',
            mr: 0.5,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          About
        </Box>
        {SOCIAL_LINKS.map(({ label, href, Icon, external }) => (
          <IconButton
            key={label}
            component="a"
            href={href}
            aria-label={label}
            size="small"
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            sx={{ p: '3px', color: '#6b7280', '&:hover': { color: ACCENT.main } }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </IconButton>
        ))}
      </Box>
    </Box>
  </Box>
);

export default SidebarProfile;
