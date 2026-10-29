import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Avatar, 
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import WorkExperienceSection from './components/WorkExperienceSection';
import EducationSection from './components/EducationSection';
import TechnicalSkillsSection from './components/TechnicalSkillsSection';
import ProjectsSection from './components/ProjectsSection';
import CurrentFocusSection from './components/CurrentFocusSection';

// 사진을 누르면 내려받는 파일 (public/docs 에 같은 이름으로 둔다)
const RESUME_FILE_NAME = '백엔드_개발자_박종혁_이력서.pdf';

const About = () => {
  return (
    <Box sx={{ 
      p: 4, 
      pt: 8,  // 상단 여백 추가
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      <Helmet>
        <title>소개 | DevJack Blog</title>
        <meta name="description" content="Java · Kotlin 백엔드 개발자 박종혁(DevJack)의 경력, 기술 스택, 프로젝트 소개" />
      </Helmet>
      {/* 헤더 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 4, 
          mb: 6,
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          <Box 
            sx={{ 
              position: 'relative', 
              display: 'inline-block',
              '&:hover .tooltip-text': {
                opacity: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.8)'
              }
            }}
          >
            <Avatar
              src={`${process.env.PUBLIC_URL}/images/profile/avatar.jpg`}
              onClick={() => {
                const link = document.createElement('a');
                link.href = `${process.env.PUBLIC_URL}/docs/${RESUME_FILE_NAME}`;
                link.download = RESUME_FILE_NAME;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              sx={{
                width: { xs: 150, md: 200 },
                height: { xs: 150, md: 200 },
                border: '4px solid #000000',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)'
                }
              }}
            />
            <Box
              className="tooltip-text"
              sx={{
                position: 'absolute',
                bottom: -40,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease-in-out',
                opacity: 0.7
              }}
            >
              클릭하여 이력서 다운로드
            </Box>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" gutterBottom sx={{ 
              fontWeight: 'bold',
              color: '#000000'
            }}>
              박종혁 (DevJack)
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#000000', 
              mb: 2,
              fontWeight: 'normal'
            }}>
              Backend Developer
            </Typography>
            <Typography variant="body1" sx={{ 
              fontSize: '1.2rem', 
              lineHeight: 1.8, 
              mb: 3,
              color: '#000000'
            }}>
              안녕하세요, DevJack입니다 👋<br />
              패션업계에서 디자이너로 일하다가 개발자로 전향한 지 벌써 5년이 되었습니다.<br />
              지금은 Java와 Kotlin을 주로 사용하며 Spring Boot 기반의 다양한 서비스를 만들고 있습니다.<br /><br />
              새로운 기술을 배우는 걸 즐기고, 읽기 좋은 코드를 작성하는 데 집중합니다.<br />
              사용자에게 도움이 되는 서비스를 안정적으로 만들어내는 것이 제 목표입니다.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="5년차 개발자" sx={{ 
                backgroundColor: '#000000', 
                color: '#ffffff',
                border: '1px solid #000000'
              }} />
              <Chip label="Spring Boot" sx={{ 
                backgroundColor: '#ffffff', 
                color: '#000000',
                border: '1px solid #000000'
              }} />
              <Chip label="Kotlin/Java" sx={{ 
                backgroundColor: '#ffffff', 
                color: '#000000',
                border: '1px solid #000000'
              }} />
              <Chip label="AWS/클라우드" sx={{ 
                backgroundColor: '#ffffff', 
                color: '#000000',
                border: '1px solid #000000'
              }} />
            </Box>
          </Box>
        </Box>
      </motion.div>

      <Divider sx={{ my: 4, borderColor: '#000000' }} />

      {/* Work Experience 섹션 */}
      <WorkExperienceSection />

      <Divider sx={{ my: 4, borderColor: '#000000' }} />

      {/* Education 섹션 */}
      <EducationSection />

      <Divider sx={{ my: 4, borderColor: '#000000' }} />

      {/* Technical Skills 섹션 */}
      <TechnicalSkillsSection />

      <Divider sx={{ my: 4, borderColor: '#000000' }} />

      {/* Projects 섹션 */}
      <ProjectsSection />

      <Divider sx={{ my: 4, borderColor: '#000000' }} />

      {/* Current Focus & Interests 섹션 */}
      <CurrentFocusSection />
    </Box>
  );
};

export default About;
