import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx'; 
/**
 * PrivateRoute 컴포넌트:
 * 1. authLoading (세션 검사 중) 상태를 기다립니다.
 * 2. 미로그인 시 경로에 따라 리다이렉션 state를 다르게 설정합니다.
 */
const PrivateRoute = ({ element: Component }) => {
    const { isLoggedIn, authLoading } = useAuth();
    const location = useLocation();

    // 💡 좌석 선택 페이지인지 확인하는 플래그: /events/{eventId} 패턴 확인
    const isSeatsPath = location.pathname.startsWith('/events/');

    // 1. 인증 로딩 중: 로딩 스피너 등을 표시합니다.
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-400">인증 확인 중...</p>
            </div>
        );
    }

    // 2. 인증이 완료되었고, 로그인 상태인 경우: 요청된 컴포넌트 렌더링
    if (isLoggedIn) {
        return <Component />;
    }

    // 3. 인증이 완료되었고, 미로그인 상태인 경우 (authLoading == false && isLoggedIn == false)

    // 리다이렉트 시 전달할 기본 state: 로그인 후 돌아올 경로
    let state = { from: location };

    // 🔥 세션 만료됐지만 URL이 /events/{id} 라면 자동 리다이렉트 금지
    if (isSeatsPath) {
        return <Component />;
    }
    
    // 모든 미로그인 상태는 /login으로 리다이렉션하며, state를 함께 전달합니다.
    return <Navigate to="/login" state={state} replace />;
};

export default PrivateRoute;