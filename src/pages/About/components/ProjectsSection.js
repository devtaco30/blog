import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { projects } from '../../../data/projects';

const ProjectsSection = () => {
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
        🚀 Projects
      </Typography>
      
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 3,
        width: '100%'
      }}>
        {projects.map((project, index) => (
                      <motion.div
              key={index}
              initial={{ opacity: 0, y: 80, scale: 0.8, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            style={{ height: '100%' }}
          >
                          <Card elevation={2} sx={{ 
                height: '100%',
                border: '1px solid #e0e0e0',
                backgroundColor: '#ffffff',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                willChange: 'transform',
                '&:hover': {
                  transform: 'translateY(-16px) scale(1.03) rotateY(2deg) translateZ(0)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                  border: '2px solid #000000'
                },
                transition: 'all 0.3s ease-out'
              }}>
                              <CardContent sx={{ p: 3 }}>
                  {/* 헤더 영역 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: '#000000',
                      fontSize: '1.05rem',
                      lineHeight: 1.3,
                      mb: 1,
                      letterSpacing: '0.2px'
                    }}>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#555555',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      letterSpacing: '0.1px'
                    }}>
                      {project.period}
                    </Typography>
                  </Box>

                  {/* 구분선 */}
                  <Box sx={{ 
                    width: '100%', 
                    height: '1px', 
                    backgroundColor: '#e0e0e0', 
                    mb: 2
                  }} />

                  {/* 본문 영역 */}
                  <Box sx={{ mb: 3 }}>
                    {Array.isArray(project.description) ? (
                      project.description.map((item, idx) => (
                        <Box key={idx} sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          mb: 1,
                          '&:last-child': { mb: 0 }
                        }}>
                          <Box sx={{ 
                            width: '4px', 
                            height: '4px', 
                            borderRadius: '50%', 
                            backgroundColor: '#666666', 
                            mt: '8px', 
                            mr: 1.5,
                            flexShrink: 0
                          }} />
                          <Typography variant="body2" sx={{ 
                            color: '#333333',
                            lineHeight: 1.6,
                            fontSize: '0.9rem',
                            letterSpacing: '0.1px',
                            fontWeight: 400,
                            flex: 1
                          }}>
                            {item.split('**').map((part, partIdx) => 
                              partIdx % 2 === 1 ? (
                                <Box key={partIdx} component="span" sx={{ 
                                  fontWeight: 'bold', 
                                  color: '#000000' 
                                }}>
                                  {part}
                                </Box>
                              ) : part
                            )}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ 
                        color: '#333333',
                        lineHeight: 1.6,
                        fontSize: '0.9rem',
                        letterSpacing: '0.1px',
                        fontWeight: 400
                      }}>
                        {project.description}
                      </Typography>
                    )}
                  </Box>

                  {/* 기술 스택 영역 */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 0.6, 
                    flexWrap: 'wrap'
                  }}>
                    {project.technologies.map((tech) => (
                      <Chip 
                        key={tech} 
                        label={tech} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#f5f5f5', 
                          color: '#333333',
                          border: '1px solid #d0d0d0',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: '#e0e0e0'
                          }
                        }} 
                      />
                    ))}
                  </Box>
                </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </motion.div>
  );
};

export default ProjectsSection;
