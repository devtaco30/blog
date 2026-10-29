import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import CloudIcon from '@mui/icons-material/Cloud';
import { motion } from 'framer-motion';

const CurrentFocusSection = () => {
  // 공통 스타일 정의
  const listItemStyle = {
    color: '#333333',
    fontWeight: 500,
    fontSize: '1rem'
  };

  const bulletStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#000000'
  };

  const listItemContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 'bold', 
        mb: 4,
        color: '#000000'
      }}>
        💡 Current Focus & Interests
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.1 
            }}
          >
            <Paper elevation={2} sx={{ 
              p: 4, 
              border: '1px solid #e0e0e0',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                border: '2px solid #000000'
              },
              transition: 'all 0.3s ease'
            }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 3,
              pb: 2,
              borderBottom: '2px solid #f0f0f0'
            }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '8px', 
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ArchitectureIcon sx={{ color: '#000000', fontSize: 28 }} />
              </Box>
              <Typography variant="h6" sx={{ 
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                Core Development
              </Typography>
            </Box>
                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
               <Box sx={listItemContainerStyle}>
                 <Box sx={bulletStyle} />
                 <Typography variant="body1" sx={listItemStyle}>
                   MSA 아키텍처 설계 및 구현
                 </Typography>
               </Box>
               <Box sx={listItemContainerStyle}>
                 <Box sx={bulletStyle} />
                 <Typography variant="body1" sx={listItemStyle}>
                   도메인 주도 설계 (DDD)
                 </Typography>
               </Box>
               <Box sx={listItemContainerStyle}>
                 <Box sx={bulletStyle} />
                 <Typography variant="body1" sx={listItemStyle}>
                   시스템 성능 최적화
                 </Typography>
               </Box>
               <Box sx={listItemContainerStyle}>
                 <Box sx={bulletStyle} />
                                  <Typography variant="body1" sx={listItemStyle}>
                   데이터베이스 설계 및 튜닝
                 </Typography>
               </Box>
             </Box>
          </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.2 
            }}
          >
            <Paper elevation={2} sx={{ 
              p: 4, 
              border: '1px solid #e0e0e0',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                border: '2px solid #000000'
              },
              transition: 'all 0.3s ease'
            }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 3,
              pb: 2,
              borderBottom: '2px solid #f0f0f0'
            }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '8px', 
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CloudIcon sx={{ color: '#000000', fontSize: 28 }} />
              </Box>
              <Typography variant="h6" sx={{ 
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                Emerging Technologies
              </Typography>
            </Box>
                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
               <Box sx={listItemContainerStyle}>
                 <Box sx={bulletStyle} />
                 <Typography variant="body1" sx={listItemStyle}>
                   AI/ML 서비스 연동
                 </Typography>
               </Box>
               <Box sx={listItemContainerStyle}>
                 <Box sx={bulletStyle} />
                 <Typography variant="body1" sx={listItemStyle}>
                   LLM 기반 AI 에이전트 개발
                 </Typography>
               </Box>
               <Box sx={listItemContainerStyle}>
                 <Box sx={bulletStyle} />
                 <Typography variant="body1" sx={listItemStyle}>
                   AI 활용한 바이브코딩 - 통합 RN 앱 개발
                 </Typography>
               </Box>
               <Box sx={listItemContainerStyle}>
                 <Box sx={bulletStyle} />
                 <Typography variant="body1" sx={listItemStyle}>
                   Service Mesh
                 </Typography>
               </Box>
             </Box>
          </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default CurrentFocusSection;
