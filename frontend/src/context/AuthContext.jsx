import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from "react-router-dom";
import axios from 'axios'; // ✨ axios import 추가

// API 호출에 사용할 기본 URL 설정
const API_BASE_URL = 'http://localhost:8080/api/users';


// 모든 API 요청에 HttpOnly 쿠키가 자동으로 포함되도록 Axios 기본 설정
// 이 설정이 중요합니다. 모든 요청에 'withCredentials: true'를 개별적으로 붙일 필요가 없어집니다.
axios.defaults.withCredentials = true;

const AuthContext = createContext({
    isLoggedIn: false,
    userRole: null, 
    userName: null,
    userId: null,
    authLoading: true, // 초기 로딩 상태
    login: () => {},
    logout: () => {},
});

/**
 * useAuth Custom Hook:
 * 컨텍스트 값을 간편하게 가져오기 위한 훅입니다.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.');
    }
    return context;
};

// LocalStorage 키 정의
const USER_ROLE_KEY = 'userRole';
const USER_ID_KEY = 'userId';
const USER_NAME_KEY = 'userName';

/**
 * AuthProvider Component:
 * 인증 상태를 관리하고 하위 컴포넌트에 제공하는 Provider 컴포넌트입니다.
 */
export const AuthProvider = ({ children }) => {
    // LocalStorage에서 초기 상태 로드
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem(USER_ROLE_KEY)); 
    const [userRole, setUserRole] = useState(() => localStorage.getItem(USER_ROLE_KEY) || null);
    const [userId, setUserId] = useState(() => {
        const storedId = localStorage.getItem(USER_ID_KEY);
        // ID는 문자열로 저장되지만, React 상태에는 숫자로 저장하여 관리합니다.
        return storedId ? Number(storedId) : null;
    });
    const [userName, setUserName] = useState(() => localStorage.getItem(USER_NAME_KEY) || null);
    
    // 초기 세션 검사 완료 상태: 기본값은 true (로딩 중)
    const [authLoading, setAuthLoading] = useState(true);

    /* ---------------------------------------------------
     * 로그아웃 함수: useCallback으로 안정화
     * callServer = true: 서버에 /logout 요청 (수동 로그아웃)
     * callServer = false: 로컬 상태만 초기화 (자동/인터셉터 로그아웃)
     * --------------------------------------------------- */
    const logout = useCallback(async (callServer = true) => {
        try {
            if (callServer) {
                // HttpOnly 쿠키 무효화 및 삭제를 위해 서버에 요청
                await axios.post(`${API_BASE_URL}/logout`);
                console.log('✅ 서버 로그아웃 요청 성공');
            }
        } catch (err) {
            // 서버 요청에 실패하더라도 로컬 로그아웃은 진행합니다.
            if (callServer) console.error("로그아웃 요청 중 오류 발생 (클라이언트 상태는 초기화):", err.message);
        } finally {
            // 클라이언트 상태 초기화 (LocalStorage와 React State)
            localStorage.removeItem(USER_ROLE_KEY);
            localStorage.removeItem(USER_ID_KEY);
            localStorage.removeItem(USER_NAME_KEY);

            setUserRole(null);
            setUserId(null);
            setUserName(null);
            setIsLoggedIn(false);
            
            console.log("🟦 클라이언트 상태 초기화 완료");
        }
    }, []); // 의존성 없음


    /* ---------------------------------------------------
     * 로그인 함수: useCallback으로 안정화
     * 백엔드 /me 응답 형식: {userId: Long, nickname: String, role: String}
     * --------------------------------------------------- */
    const login = useCallback((role, id, nickname) => {
        // LocalStorage 업데이트
        localStorage.setItem(USER_ROLE_KEY, role); 
        localStorage.setItem(USER_ID_KEY, id.toString());
        localStorage.setItem(USER_NAME_KEY, nickname); // 백엔드 nickname을 프론트 userName으로 사용
        
        // 상태 업데이트
        setUserRole(role);
        setUserId(Number(id));
        setUserName(nickname);
        setIsLoggedIn(true);
        console.log('로그인 상태 동기화 성공. 역할:', role, 'ID:', id, 'UserName:', nickname);
    }, []);


    /* ---------------------------------------------------
     * 1. 초기 세션 검사 (Initial Check)
     * --------------------------------------------------- */
    useEffect(() => {

        const checkAuth = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/me`);
    
                if (res.data.userId && res.data.nickname && res.data.role) {
                    login(res.data.role, res.data.userId, res.data.nickname);
                } else {
                    await logout(false);
                }
            } catch (err) {
                console.log("🔴 초기 세션 검사 실패 → 자동 로그아웃");
                await logout(false);
            } finally {
                setAuthLoading(false);
            }
        };
    
        checkAuth();
    
    }, [login, logout]);
    

    /* ---------------------------------------------------
     * 2. axios 응답 인터셉터 (Interceptor for Auto-Logout)
     * --------------------------------------------------- */
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                // API 호출 중 401(Unauthorized) 또는 403(Forbidden) 감지 시
                if (error.response?.status === 401 || error.response?.status === 403) {
                    console.log("🔴 인터셉터: API 호출 중 401/403 감지 → 자동 로그아웃");
                    
                    // 서버 호출 없이 로컬 상태만 정리
                    logout(false); 
                    
                    // 에러를 던져서 해당 API 요청을 실패 처리합니다.
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
        );

        // 컴포넌트 언마운트 시 인터셉터 정리
        return () => axios.interceptors.response.eject(interceptor);
    }, [logout]);


    // Context에 제공할 값: 필요한 값만 useMemo로 메모이제이션
    const value = useMemo(() => ({
        isLoggedIn,
        userRole,
        userId,
        userName,
        authLoading, 
        login,
        logout,
    }), [isLoggedIn, userRole, userId, userName, authLoading, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};