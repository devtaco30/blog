import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { motion } from 'framer-motion';
import { skills, getProgressBarConfig } from '../../../data/skills';

const TechnicalSkillsSection = () => {
  const [hoveredSkill, setHoveredSkill] = React.useState(null);

  // 공통 스타일
  const cardStyle = {
    p: 2, 
    width: 120,
    height: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    border: '1px solid #000000',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    position: 'relative !important',
    overflow: 'visible',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      backgroundColor: '#f8f8f8'
    },
    transition: 'all 0.3s ease'
  };

  const progressBarStyle = (top) => ({
    position: 'absolute',
    top: top,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '8px 12px',
    borderRadius: '6px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    zIndex: 9999,
    minWidth: '120px',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      border: '4px solid transparent',
      borderTopColor: '#000000'
    }
  });

  const sectionTitleStyle = {
    mb: 3, 
    display: 'flex', 
    alignItems: 'center', 
    gap: 1, 
    color: '#000000',
    fontWeight: 'bold'
  };

  const skillNameStyle = {
    fontWeight: 'bold', 
    fontSize: '0.75rem',
    color: '#000000'
  };

  // 공통 렌더링 함수
  const renderProgressBar = (skillName, category, top) => (
    <Box sx={{
      ...progressBarStyle(top),
      opacity: hoveredSkill === skillName ? 1 : 0
    }}>
      <Box sx={{ mb: 1, fontSize: '0.6rem' }}>
        {skillName}
      </Box>
      <Box sx={{ 
        width: '100px', 
        height: '6px', 
        backgroundColor: '#333333',
        borderRadius: '3px',
        overflow: 'hidden',
        mx: 'auto'
      }}>
        <Box sx={{
          width: getProgressBarConfig(skillName, category).width,
          height: '100%',
          backgroundColor: getProgressBarConfig(skillName, category).color,
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }} />
      </Box>
      <Box sx={{ mt: 1, fontSize: '0.6rem' }}>
        {getProgressBarConfig(skillName, category).level}
      </Box>
    </Box>
  );

  const renderSkillCard = (skillName, category, iconSrc, fallbackText, top = '-80px') => (
    <Card 
      elevation={1} 
      onMouseEnter={() => setHoveredSkill(skillName)}
      onMouseLeave={() => setHoveredSkill(null)}
      sx={cardStyle}
    >
      <Box sx={{ textAlign: 'center' }}>
        {iconSrc ? (
          <img 
            src={iconSrc}
            alt={skillName}
            style={{
              width: '54px',
              height: '54px',
              objectFit: 'contain',
              marginBottom: '8px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (fallbackText) parent.textContent = fallbackText;
            }}
          />
        ) : (
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1
          }}>
            <img 
              src={`${process.env.PUBLIC_URL}/images/icons/${skillName === 'JPA/Hibernate' ? 'jpa' : skillName === 'Spring Boot' ? 'springboot' : skillName.toLowerCase()}.png`}
              alt={skillName}
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                if (skillName === 'Java') parent.textContent = '☕';
                else if (skillName === 'Kotlin') parent.textContent = 'K';
                else if (skillName === 'Spring Boot') parent.textContent = '🌱';
                else if (skillName === 'JPA/Hibernate') parent.textContent = '🗄️';
              }}
            />
          </Box>
        )}
        <Typography variant="body2" sx={skillNameStyle}>
          {skillName}
        </Typography>
      </Box>
      
      {renderProgressBar(skillName, category, top)}
    </Card>
  );

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
          🛠 Technical Skills
        </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 4
      }}>
        {/* Core Skills */}
        <Box>
          <Typography variant="h6" sx={sectionTitleStyle}>
            <CodeIcon sx={{ color: '#000000' }} /> Core Skills
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2 
          }}>
            {skills.main.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {renderSkillCard(skill.name, 'Core Skills', null, null, '-60px')}
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* Infrastructure */}
        <Box>
          <Typography variant="h6" sx={sectionTitleStyle}>
            <StorageIcon sx={{ color: '#000000' }} /> Infrastructure
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2 
          }}>
            {skills.infrastructure.map((infra, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {renderSkillCard(infra, 'Infrastructure', `${process.env.PUBLIC_URL}/images/icons/${infra.toLowerCase()}.png`, null, '-80px')}
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* Tools */}
        <Box>
          <Typography variant="h6" sx={sectionTitleStyle}>
            <CodeIcon sx={{ color: '#000000' }} /> Tools & Platforms
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2 
          }}>
            {skills.tools.map((tool, index) => (
              <motion.div
                key={tool}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {renderSkillCard(tool, 'Tools', `${process.env.PUBLIC_URL}/images/icons/${tool.toLowerCase()}.png`, null, '-80px')}
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* AI Tools */}
        <Box>
          <Typography variant="h6" sx={sectionTitleStyle}>
            <AutoAwesomeIcon sx={{ color: '#000000' }} /> AI Tools
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2 
          }}>
            {skills.ai.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {renderSkillCard(tool.name, 'AI Tools', `${process.env.PUBLIC_URL}/images/icons/${tool.icon}`, null, '-80px')}
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default TechnicalSkillsSection;
