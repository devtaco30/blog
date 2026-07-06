import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';

const VisitorCounter = () => {
  // AuthContext에서 로그인 상태 확인 (로그인은 AuthContext에서 처리)
  // 로그인 체크 방식: AuthContext의 useAuth() 훅 사용
  const { user, loading: authLoading } = useAuth();

  const [visitors, setVisitors] = useState({
    today: 0,
    total: 0,
    loading: true
  });
  const [visitIncremented, setVisitIncremented] = useState(false);
  
  // 개발 모드에서 방문 기록 자동 삭제 (Supabase 세션은 유지)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 방문 기록만 삭제 (Supabase 세션 키는 삭제하지 않음)
      localStorage.removeItem('lastVisit');
      sessionStorage.removeItem('sessionVisit');
    }
  }, []);
  
  // 로그인 상태가 변경되면 처리
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        const githubUsername = user.user_metadata?.user_name;
        const allowedUsersEnv = process.env.REACT_APP_ALLOWED_GITHUB_USERS;
        const allowedUsers = allowedUsersEnv?.split(',').map(u => u.trim()) || [];
        
        // 본인 계정으로 로그인한 경우, 카운팅 방지
        if (allowedUsers.includes(githubUsername)) {
          setVisitIncremented(true); // true로 설정해서 카운팅 방지
        } else {
          // 로그인은 했지만 본인이 아닌 경우, 카운팅 가능하도록
          setVisitIncremented(false);
        }
      } else {
        // 로그인 안 된 경우, 카운팅 가능하도록
        setVisitIncremented(false);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    const fetchVisitorStats = async () => {
      try {
        // 오늘 날짜의 방문자 통계 가져오기
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('visitor_stats')
          .select('*')
          .eq('date', today)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116는 데이터가 없는 경우
          console.error('방문자 통계 조회 실패:', error);
          return;
        }

        const todayCount = data?.daily_count || 0;
        const totalCount = data?.total_count || 0;

        setVisitors({
          today: todayCount,
          total: totalCount,
          loading: false
        });


      } catch (error) {
        console.error('방문자 통계 조회 실패:', error);
        setVisitors({
          today: 0,
          total: 0,
          loading: false
        });
      }
    };

    fetchVisitorStats();
  }, []);

  // 로그인 체크 (항상 실행, visitIncremented와 무관)
  useEffect(() => {
    // 인증 로딩 중이면 대기
    if (authLoading) {
      return;
    }

    // 로그인된 사용자 체크 (항상 실행)
    if (user) {
      const githubUsername = user.user_metadata?.user_name;
      const allowedUsersEnv = process.env.REACT_APP_ALLOWED_GITHUB_USERS;
      const allowedUsers = allowedUsersEnv?.split(',').map(u => u.trim()) || [];

      // 허용된 사용자 목록에 포함된 경우(본인) 카운팅에서 제외
      if (allowedUsers.includes(githubUsername)) {
        setVisitIncremented(true);
      } else {
        // 본인이 아니면 visitIncremented 리셋 (카운팅 가능하도록)
        setVisitIncremented(false);
      }
    } else {
      // 로그인 안 됐으면 visitIncremented 리셋 (카운팅 가능하도록)
      setVisitIncremented(false);
    }
  }, [user, authLoading]);
  
  // 방문자 수 증가 (중복 방지)
  useEffect(() => {
    // 인증 로딩 중이면 대기 (세션 확인 완료될 때까지)
    if (authLoading) {
      return;
    }

    if (!visitors.loading && !visitIncremented) {
      const incrementVisit = async () => {
        try {
          const today = new Date().toISOString().split('T')[0];

          // 추가 옵션: localStorage 플래그 또는 user-agent 체크
          const userAgent = navigator.userAgent;
          const excludeFromCount = localStorage.getItem('excludeFromVisitorCount');

          if (excludeFromCount === 'true' || userAgent.includes('DevTaco-Exclude')) {
            setVisitIncremented(true);
            return;
          }

          // localStorage와 sessionStorage로 중복 방지
          const lastVisit = localStorage.getItem('lastVisit');
          const sessionVisit = sessionStorage.getItem('sessionVisit');

          if (lastVisit !== today || !sessionVisit) {
            // Supabase 함수 호출로 방문자 수 증가
            const { error } = await supabase.rpc('increment_visitor_count');

            if (error) {
              console.error('❌ 방문자 수 증가 실패:', error);
              return;
            }

            // 방문 기록 저장
            localStorage.setItem('lastVisit', today);
            sessionStorage.setItem('sessionVisit', 'true');

            // 방문자 수 증가 후 최신 데이터 가져오기
            const { data: updatedStats, error: fetchError } = await supabase
              .from('visitor_stats')
              .select('*')
              .eq('date', today)
              .single();

            if (!fetchError && updatedStats) {
              setVisitors({
                today: updatedStats.daily_count,
                total: updatedStats.total_count,
                loading: false
              });
            }

            setVisitIncremented(true);
          } else {
            setVisitIncremented(true);
          }
        } catch (error) {
          console.error('방문자 수 증가 처리 실패:', error);
          setVisitIncremented(true);
        }
      };

      incrementVisit();
    }
  }, [visitors.loading, visitIncremented, user, authLoading]);

  // 실시간 구독 (선택사항)
  useEffect(() => {
    if (!visitors.loading) {
      const channel = supabase
        .channel('visitor_stats')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'visitor_stats'
          },
          (payload) => {
            setVisitors({
              today: payload.new.daily_count,
              total: payload.new.total_count,
              loading: false
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [visitors.loading]);

  if (visitors.loading) {
    return (
      <Box className="visitor-counter" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          방문자 수
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
          <CircularProgress size={16} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            로딩 중...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="visitor-counter" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        방문자 수
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          {visitors.today}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          오늘
        </Typography>
        <Typography variant="h6" color="text.secondary">
          총 {visitors.total}명
        </Typography>
      </Box>
    </Box>
  );
};

export default VisitorCounter; 