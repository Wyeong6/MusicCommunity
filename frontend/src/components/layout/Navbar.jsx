import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, LogIn, UserPlus, Users, User, MessageSquare } from 'lucide-react'; // ✨ Users 아이콘이 여기에 포함되어야 합니다.
import { useAuth } from '../../context/AuthContext.jsx'; 


const Navbar = () => {
    // AuthContext에서 필요한 상태값 (isLoggedIn, userRole)과 함수(logout)를 가져옵니다.
    const { isLoggedIn, logout, userRole, userId, userName } = useAuth();
    
    // ⭐⭐ 핵심 수정: userRole 값을 대문자로 변환하여 'ADMIN'과 비교합니다.
    const isAdmin = isLoggedIn && 
                        userRole && 
                        String(userRole).trim().toUpperCase() === 'ADMIN';

                        console.log('userName:',userName);

    return (
        <header className="bg-gray-800 shadow-md">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-teal-400 hover:text-teal-300 transition duration-300">
                    Music Community
                </Link>
                <div className="flex space-x-4 items-center">
                    
                    {/* 1. 관리자 페이지 버튼 (isAdmin일 때만 렌더링) */}
                    {isAdmin && (
                        <Link 
                            to="/admin" 
                            className="flex items-center text-yellow-400 hover:text-yellow-300 transition duration-300 font-semibold border border-yellow-400 px-3 py-1 rounded-lg"
                        >
                            <Users className="w-5 h-5 mr-1" />
                            관리자 페이지
                        </Link>
                    )}

                    {/* 2. 로그인 상태에 따른 버튼 조건부 렌더링 */}
                    {isLoggedIn ? (
                        // 로그인 상태일 때는 마이페이지와 로그아웃 버튼 노출
                        <>

                            <Link to="/reviews" className="flex items-center text-gray-700 hover:text-teal-600 transition">
                                <MessageSquare size={18} className="mr-1" />
                                후기 게시판
                            </Link>
                            
                            {/* 2-1. 마이페이지 버튼 (로그인 시 노출) */}
                            <Link 
                                to={`/mypage/${userId}`} // 백엔드 @GetMapping("/mypage/{id}") 경로에 맞춤
                                className="flex items-center text-blue-400 hover:text-blue-300 transition duration-300 font-semibold border border-blue-400 px-3 py-1 rounded-lg"
                            >
                                <User className="w-5 h-5 mr-1" />
                                마이페이지 ({userName})
                            </Link>
                            
                            {/* 2-2. 로그아웃 버튼 */}
                            <button
                                onClick={logout} // Context의 logout 함수 사용
                                className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 shadow-md"
                            >
                                <LogOut className="w-4 h-4 mr-1" />
                                로그아웃
                            </button>
                        </>
                    ) : (
                        // 로그아웃 상태일 때는 로그인과 회원가입 버튼 노출
                        <>
                                                    {/* 후기 게시판 링크 추가! */}
                            <Link to="/reviews" className="flex items-center text-gray-700 hover:text-teal-600 transition">
                                <MessageSquare size={18} className="mr-1" />
                                후기 게시판
                            </Link>

                            <Link to="/login" className="flex items-center text-gray-300 hover:text-white transition duration-300">
                                <LogIn className="w-4 h-4 mr-1" />
                                로그인
                            </Link>

                            <Link to="/register" className="flex items-center px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300 shadow-md">
                                <UserPlus className="w-4 h-4 mr-1" />
                                회원가입
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;