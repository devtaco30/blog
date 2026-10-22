import React from 'react';
import { Avatar, Box, Typography, IconButton, Stack, Chip, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import profileImage from '../../IMG_9335.jpg';

function Profile() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 1.5, md: 2 }
      }}>
        <Avatar
          src={profileImage}
          sx={{
            width: { xs: 80, md: 120 },
            height: { xs: 80, md: 120 },
            border: '4px solid white',
            boxShadow: '0 0 20px rgba(0,0,0,0.1)'
          }}
        />
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}
          >
            DevJack
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'white',
              px: { xs: 1.5, md: 2 },
              py: 0.5,
              borderRadius: 5,
              display: 'inline-block',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', md: '0.875rem' }
            }}
          >
            Backend Developer
          </Typography>
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center',
            color: 'text.secondary',
            lineHeight: 1.6,
            wordBreak: 'keep-all',
            whiteSpace: 'pre-line'
          }}
        >
          코드를 깔끔하게 짜는 걸 좋아하는 Java/Kotlin 백엔드 개발자입니다.
        </Typography>

        <Divider sx={{ width: '100%', my: 2 }} />

        <Box sx={{ width: '100%', textAlign: 'left' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WorkIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              경력: 5년차 (블루밍비트, 웨이브릿지)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              서울, 대한민국
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            주요 기술
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip label="Java" size="small" variant="outlined" />
            <Chip label="Kotlin" size="small" variant="outlined" />
            <Chip label="Spring Boot" size="small" variant="outlined" />
            <Chip label="MSA" size="small" variant="outlined" />
            <Chip label="AWS" size="small" variant="outlined" />
            <Chip label="Redis" size="small" variant="outlined" />
            <Chip label="Kafka" size="small" variant="outlined" />
            <Chip label="Jenkins" size="small" variant="outlined" />
          </Box>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }} />

        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            연락처
          </Typography>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ justifyContent: 'center' }}
          >
            <IconButton 
              href="https://github.com/devtaco30" 
              target="_blank"
              size="small"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              <GitHubIcon />
            </IconButton>
            <IconButton 
              href="mailto:devtaco@naver.com"
              size="small"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              <EmailIcon />
            </IconButton>
            <IconButton 
              href="https://www.linkedin.com/in/jonghyuk-park-02b1a1203" 
              target="_blank"
              size="small"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              <LinkedInIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default Profile;