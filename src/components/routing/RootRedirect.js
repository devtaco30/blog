import React from 'react';
import { Navigate } from 'react-router-dom';

// 홈 화면을 없앴으므로 기존 주소(/)로 들어온 사람은 글 목록으로 보낸다.
// replace: 뒤로 가기를 눌렀을 때 다시 / 로 돌아와 계속 튕기지 않게 한다.
const RootRedirect = () => <Navigate to="/posts" replace />;

export default RootRedirect;
