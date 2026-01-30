import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; 
import NavBar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './Home'; 
import Seats from './Seats';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from "./pages/MyPage";
import PrivateRoute from './context/PrivateRoute'; 
import AdminPage from './pages/AdminPage.jsx';
import ReviewList from './pages/ReviewList.jsx';
import ReviewForm from './pages/ReviewForm.jsx';
import ReviewDetail from './pages/ReviewDetail.jsx';
import ReviewEdit from './pages/ReviewEdit.jsx';





function App() {
    // AuthContext를 사용하므로 App.jsx에서는 로그인 상태 로직이 필요 없습니다.

    return (
        // 전체 배경 및 텍스트 설정. Footer를 하단에 고정하기 위해 flex-col과 min-h-screen 사용
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
            {/* NavBar는 Props 없이 useAuth()를 통해 상태를 가져옵니다. */}
            <NavBar />

            {/* main 태그에 flex-grow를 주어 NavBar와 Footer 사이의 공간을 모두 차지하게 합니다 */}
            <main className="container mx-auto p-4 pt-8 flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} /> 

                    {/* Login 컴포넌트 또한 useAuth().login()을 직접 호출합니다. */}
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/register" element={<Register />} />

                    {/* 좌석 선택 페이지 경로 */}
                    <Route 
                        path="/events/:eventId" 
                        element={<PrivateRoute element={Seats} />} 
                    /> 
                    
                    <Route 
                        path="/mypage/:id" 
                        element={<PrivateRoute element={MyPage} />} 
                    />

                    <Route path="/admin" element={<AdminPage />} />

                    <Route path="/reviews" element={<ReviewList />} />

                    <Route path="/reviews/create" element={<ReviewForm />} /> {/* 이 경로가 있어야 합니다! */}

                    <Route path="/reviews/:id" element={<ReviewDetail />} />

                    <Route path="/reviews/edit/:id" element={<ReviewEdit />} />

                </Routes>
            </main>
            
            {/* Footer 컴포넌트 추가 */}
            <Footer />
        </div>
    );
}

export default App;
