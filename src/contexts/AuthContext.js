import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { HASH_ROUTES } from '../constants/routes';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      // 🔥 에러 URL 감지 및 처리
      if (window.location.search.includes('error=server_error')) {
        // 에러 메시지 표시
        alert('허용되지 않은 GitHub 계정입니다. 홈페이지로 돌아갑니다.');
        
        // 홈페이지로 리다이렉트
        window.location.hash = HASH_ROUTES.HOME;
        
        // URL 정리
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      try {
        // URL 해시에서 토큰 확인
        const hash = window.location.hash;

        if (hash.includes('access_token=')) {
          // URL에서 토큰 파싱 (해시 구조 수정)
          // #/#access_token=... 형태 처리
          const tokenPart = hash.split('#access_token=')[1] || hash.split('access_token=')[1];
          if (tokenPart) {
            const accessToken = tokenPart.split('&')[0];
            const refreshTokenPart = tokenPart.split('&refresh_token=')[1];
            const refreshToken = refreshTokenPart ? refreshTokenPart.split('&')[0] : '';

            if (accessToken) {
              // Supabase 세션 수동 설정
              try {
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || ''
                });

                if (error) {
                  console.error('❌ [AuthContext] 세션 설정 실패:', error);
                } else if (data?.user) {
                  setUser(data.user);
                }
              } catch (sessionError) {
                console.error('💥 [AuthContext] 세션 설정 중 오류:', sessionError);
              }
            }
          }
        }

        // 해시 정리 - 자동 리다이렉트 제거
        if (hash.includes('access_token=')) {
          window.location.hash = '';
        }

        // 브라우저 초기화 시간 대기
        await new Promise(resolve => setTimeout(resolve, 500));

        // 세션 확인
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('💥 세션 조회 중 예외:', error);
        // 예외 발생 시 세션 초기화
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('💥 로그아웃 중 오류:', signOutError);
        }
        setLoading(false);
      }
    };

    getSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // SIGNED_IN: GitHub OAuth 로그인 완료 - 자동 리다이렉트 제거, 사용자가 직접 관리자 페이지로 이동

        // 세션이 있으면 사용자 정보 설정
        if (session?.user) {
          setUser(session.user);
        } else if (event === 'INITIAL_SESSION' && !session) {
          // INITIAL_SESSION에서 세션이 없으면 getUser()로 재시도
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              setUser(user);
            }
          } catch (error) {
            console.error('❌ getUser() 실패:', error);
          }
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ 로그인 실패:', error.message);
    }
    
    return { error };
  };

  const signUp = async (email, password) => {

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ 회원가입 실패:', error.message);
      console.error('❌ 에러 상세:', error);
    }
    
    return { error };
  };

  const signOut = async () => {

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ 로그아웃 실패:', error.message);
    } else {

    }
    
    return { error };
  };

  const signInWithGitHub = async () => {
    // 허용된 GitHub 사용자 목록
    const allowedUsers = process.env.REACT_APP_ALLOWED_GITHUB_USERS?.split(',');
    
    if (!allowedUsers || allowedUsers.length === 0) {
      console.error('❌ 허용된 GitHub 사용자가 설정되지 않았습니다.');
      alert('GitHub 로그인이 설정되지 않았습니다.');
      return;
    }
    
    // 현재 로그인된 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 이미 로그인된 상태라면 허용된 사용자인지 확인
      const githubUsername = user.user_metadata?.user_name;
      
      if (!allowedUsers.includes(githubUsername)) {
        alert(`허용되지 않은 GitHub 계정입니다: ${githubUsername}`);
        return;
      }
    }
    

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/devtaco-blog/#/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      console.error('❌ GitHub 로그인 실패:', error.message);
    }
    
    return { error };
  };

  // 테스트용 함수 (Console에서 호출 가능)
  const testAuth = async () => {
    try {
      await supabase.auth.getSession();
    } catch (err) {
      console.error('세션 테스트 오류:', err);
    }
  };

  // 전역에서 접근 가능하도록 설정
  if (typeof window !== 'undefined') {
    window.testAuth = testAuth;
    window.authContext = { user, loading, signIn, signUp, signOut };
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGitHub,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
