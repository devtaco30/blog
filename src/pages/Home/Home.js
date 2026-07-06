import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Helmet } from 'react-helmet-async';
import { getAllPosts } from '../../services/posts';


const Home = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await getAllPosts();
        
        // Supabase 응답 구조에 맞게 수정
        const posts = allPosts.data || [];
        
        // 발행된 포스트 중 Home 노출 설정된 것만 필터링
        const filteredPosts = posts
          .filter(post => post.is_published === true && post.is_featured === true);
        
        // 최신 3개만 선택
        const featured = filteredPosts.slice(0, 3);
        
        setFeaturedPosts(featured);
      } catch (error) {
        console.error('❌ Featured Posts를 불러오는데 실패했습니다:', error);
      } finally {

        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      position: 'relative',
      backgroundColor: '#ffffff'
    }}>
      <Helmet>
        <title>DevTaco Blog — Java · Kotlin 백엔드 개발자 박종혁</title>
        <meta name="description" content="Java · Kotlin 백엔드 개발 경험과 학습 기록을 공유하는 기술 블로그" />
      </Helmet>
      {/* Main Content */}
      <Box sx={{ 
        textAlign: 'center',
        maxWidth: 800,
        width: '100%'
      }}>
        {/* Profile Image */}
        <Box
          sx={{
            width: 120,
            height: 120,
            mx: 'auto',
            mb: 3,
            borderRadius: '50%',
            border: '3px solid #000000',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            // src={`${process.env.PUBLIC_URL}/images/profile/profile_ver.fe.3.png`}
            // src={`${process.env.PUBLIC_URL}/images/profile/profile_ver.fe.2.png`}
            src={`${process.env.PUBLIC_URL}/images/profile/profile.png`}
            alt="DevTaco Profile"
            style={{
              width: '180%',
              height: '180%',
              objectFit: 'cover',
              transform: 'translate(-1%, 23%)'
            }}
          />
        </Box>

        {/* Name and Title */}
        <Typography variant="h2" sx={{ 
          fontWeight: 'bold', 
          mb: 2,
          color: '#000000'
        }}>
          I am DevTaco
        </Typography>



        {/* Social Links */}
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mb: 4 }}>
          <IconButton 
            href="https://github.com/devtaco30" 
            target="_blank"
            sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: '#000000',
              border: '1px solid #000000',
              '&:hover': { 
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s'
            }}
          >
            <GitHubIcon />
          </IconButton>
          <IconButton 
            href="mailto:devtaco@naver.com"
            sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: '#000000',
              border: '1px solid #000000',
              '&:hover': { 
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
            sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: '#000000',
              border: '1px solid #000000',
              '&:hover': { 
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s'
            }}
          >
            <LinkedInIcon />
          </IconButton>
        </Stack>

        {/* Description */}
        <Box sx={{ 
          textAlign: 'center',
          mt: 4
        }}>
          <Typography
            variant="h5"
            sx={{
              color: '#000000',
              fontWeight: 'normal',
              lineHeight: 1.4
            }}
          >
            Backend Developer <br />
            Java & Kotlin Specialist
          </Typography>
        </Box>

        <Divider sx={{ my: 4, backgroundColor: '#000000' }} />

        {/* Recent Posts */}
        <Typography variant="h6" sx={{ 
          fontWeight: 'bold', 
          mb: 3,
          textAlign: 'left',
          color: '#000000'
        }}>
          Recent posts:
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'left' }}>
            {[1, 2, 3].map((item) => (
              <Typography key={item} variant="body1" sx={{ mb: 1, color: '#000000' }}>
                Loading...
              </Typography>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'left' }}>
            {featuredPosts.map((post, index) => (
              <Box key={post.slug}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 1, 
                    color: '#000000',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  {post.title}
                </Typography>
                {index < featuredPosts.length - 1 && (
                  <Divider sx={{ my: 1, backgroundColor: '#000000' }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Home;
