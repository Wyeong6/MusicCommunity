import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() { 
        const { login } = useAuth();
        const navigate = useNavigate(); 
        const [userLoginId, setUserLoginId] = useState('');
        const [password, setPassword] = useState('');
        const [message, setMessage] = useState('');
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            setMessage('로그인 요청 중...');
            
            // CORS 및 HttpOnly 쿠키 처리를 위해 withCredentials: true는 필수입니다.
            try {
                const response = await axios.post(
                    'http://localhost:8080/api/users/login', 
                    { userLoginId, password },
                    { withCredentials: true });
                
                if (response.status === 200) { 

                    console.log("user = ", response.data)
                    
                    // --- 이 부분이 핵심 수정입니다. ---
                    // 1. 서버 응답 본문(response.data)에서 사용자 role을 추출합니다.
                    //    (아래 코드에서는 'role'이라는 필드를 가정했습니다.)
                    const userRole = response.data.role || 'user'; // 서버가 role을 주지 않으면 기본값 'user'
                    const userId = response.data.id; // ✨ 서버에서 사용자 ID를 추출
                    const userLoginId = response.data.userLoginId;
                    const userNickName = response.data.nickname;

                    console.log("userNickName = ", response.data.nickname)
                    console.log("useruserLoginId = ", response.data.userLoginId)


                      // userId가 없는 경우, 로그인을 진행하지 않고 에러 메시지 출력
                    if (!userId) {
                        setMessage('로그인 성공! 하지만 사용자 ID를 서버에서 받지 못했습니다.');
                        console.error('서버 응답에 userId가 누락되었습니다.', response.data);
                        return;
                    }

                    setMessage(`로그인 성공! 역할: ${userRole}. 고유ID번호: ${userId}. 메인 페이지로 이동합니다.`);
        
                    // 2. AuthContext의 login 함수에 추출된 role을 전달합니다.
                    login(userRole, userId, userNickName); 
                    
                    setTimeout(() => navigate('/'), 0);
                }
            } catch (error) {
                console.error("Login error:", error);
                if (error.response && error.response.status === 401) {
                     setMessage('로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
                } else {
                     setMessage('로그인 중 오류가 발생했습니다.');
                }
            }
        };
    
        return (
            // min-h-[calc(100vh-160px)] 클래스는 헤더/푸터를 제외한 최소 높이를 확보합니다.
            <div className="flex items-center justify-center pt-10 min-h-[calc(100vh-160px)]">
                <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-6 text-center">로그인</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="아이디"
                                value={userLoginId}
                                onChange={(e) => setUserLoginId(e.target.value)}
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition duration-150"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition duration-150"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition duration-300 transform hover:scale-[1.01]"
                        >
                            로그인
                        </button>
                    </form>
                    <div className="mt-4 text-center">
                        <Link to="/register" className="text-sm text-sky-400 hover:text-sky-300">
                            계정이 없으신가요? 회원가입
                        </Link>
                    </div>
                    {message && <p className={`mt-4 text-center text-sm font-medium ${message.includes('성공') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
                </div>
            </div>
        );
    }
    
    export default Login;