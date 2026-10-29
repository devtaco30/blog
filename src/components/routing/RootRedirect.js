import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// 홈 화면을 없앴으므로 기존 주소(/)로 들어온 사람은 글 목록으로 보낸다.
// replace: 뒤로 가기를 눌렀을 때 다시 / 로 돌아와 계속 튕기지 않게 한다.
// search·hash 유지: GitHub 로그인 후 돌아오는 주소(/#access_token=...)와 로그인 오류(/?error=...)는
// AuthContext가 읽는다. 이동하면서 지우면 로그인 상태가 만들어지지 않는다.
const RootRedirect = () => {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: '/posts', search, hash }} replace />;
};

export default RootRedirect;
