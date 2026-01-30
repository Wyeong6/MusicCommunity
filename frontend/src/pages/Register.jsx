import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
    const [userLoginId, setUserLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [isAdmin, setIsAdmin] = useState(false); 
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // 리다이렉트를 위해 useNavigate 추가

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('회원가입 요청 중...');

        const dataToSend = { 
            userLoginId, 
            password, 
            nickname,
            // isAdmin이 true면 'admin', false면 'user'를 role로 전송
            role: isAdmin ? 'admin' : 'user'
        };


        try {
            const response = await axios.post('/api/users/register',  dataToSend );

            if (response.status === 201) {
                setMessage('회원가입 성공! 1.5초 후 로그인 페이지로 이동합니다.');
                
                // 성공 시 로그인 페이지로 리다이렉트
                setTimeout(() => navigate('/login'), 1500); 
            }
        } catch (error) {
            console.error("Register error:", error);
            if (error.response && error.response.data) {
                 // 서버에서 보낸 오류 메시지 사용
                 setMessage(`회원가입 실패: ${error.response.data.message || error.response.data}`);
            } else {
                 setMessage('네트워크 오류 또는 서버 오류가 발생했습니다.');
            }
        }
    };

    return (
        // min-h-[calc(100vh-160px)] 클래스는 헤더/푸터를 제외한 최소 높이를 확보합니다.
        <div className="flex items-center justify-center pt-10 min-h-[calc(100vh-160px)]">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">회원가입</h2>
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
                            placeholder="비밀번호 (4자 이상)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition duration-150"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="닉네임"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition duration-150"
                            required
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            id="isAdmin"
                            type="checkbox"
                            checked={isAdmin}
                            onChange={(e) => setIsAdmin(e.target.checked)}
                            className="h-4 w-4 text-sky-600 border-gray-600 rounded bg-gray-700 focus:ring-sky-500"
                        />
                        <label htmlFor="isAdmin" className="ml-2 text-sm text-sky-400">
                            [테스트용] 관리자 계정으로 생성
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition duration-300 transform hover:scale-[1.01]"
                    >
                        회원가입
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-sky-400 hover:text-sky-300">
                        이미 계정이 있으신가요? 로그인
                    </Link>
                </div>
                {/* 메시지 내용에 따라 성공(초록) 또는 실패(빨강) 색상을 동적으로 표시 */}
                {message && <p className={`mt-4 text-center text-sm font-medium ${message.includes('성공') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
            </div>
        </div>
    );
}

export default Register;
