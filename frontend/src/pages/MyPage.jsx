import React from 'react';
import ReservationList from './ReservationList'; // 이 파일이 동일 디렉토리에 있다고 가정하고 수정 불필요import React, { useState } from 'react';
import { useState } from 'react';
import EditProfile from './EditProfile.jsx'; // 확장자 명시
import Withdrawal from './Withdrawal.jsx'; // 확장자 명시
import { useAuth } from '../context/AuthContext.jsx'; // AuthContext 경로 확인
import { User, LogOut, UserCog, Calendar } from 'lucide-react';


// Tailwind CSS를 사용한 마이페이지 레이아웃 컴포넌트입니다.
const MyPage = () => {
  // 'reservations', 'edit', 'withdraw' 중 현재 선택된 메뉴를 관리합니다.
  const [selectedMenu, setSelectedMenu] = useState('reservations');
  const { userId } = useAuth(); // 현재 로그인된 사용자 ID를 가져와 환영 메시지에 사용
  const { userName } = useAuth();

  // 사이드바 메뉴 정의
  const menuItems = [
      { key: 'reservations', name: '내 예약 목록', icon: Calendar },
      { key: 'edit', name: '개인 정보 수정', icon: UserCog },
      { key: 'withdraw', name: '회원 탈퇴', icon: LogOut },
  ];

  // 선택된 메뉴에 따라 렌더링할 컴포넌트 결정
  let ContentComponent;
  switch (selectedMenu) {
      case 'reservations':
          ContentComponent = <ReservationList />;
          break;
      case 'edit':
          ContentComponent = <EditProfile />;
          break;
      case 'withdraw':
          ContentComponent = <Withdrawal />;
          break;
      default:
          ContentComponent = <div>페이지를 찾을 수 없습니다.</div>;
  }

  return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">
              <h1 className="text-4xl font-extrabold text-indigo-700 mb-2 flex items-center">
                  <User className="w-8 h-8 mr-2 text-indigo-500" /> 
                  My Page
              </h1>
              <p className="text-lg text-gray-500 mb-8 border-b-4 border-indigo-100 pb-3">
                  환영합니다, <span className="font-semibold text-indigo-600">{userName}</span>님. 회원 정보를 관리하세요.
              </p>

              <div className="flex flex-col lg:flex-row gap-8">
                  {/* 사이드바 영역 */}
                  <aside className="w-full lg:w-1/4">
                      <nav className="bg-indigo-50 rounded-xl p-4 shadow-lg sticky top-4">
                          <ul className="space-y-2">
                              {menuItems.map((item) => (
                                  <li key={item.key}>
                                      <div
                                          className={`flex items-center p-3 font-semibold text-lg rounded-lg transition duration-150 cursor-pointer ${
                                              selectedMenu === item.key
                                                  ? 'text-white bg-indigo-600 shadow-md hover:bg-indigo-700'
                                                  : 'text-gray-700 hover:bg-indigo-100'
                                          }`}
                                          onClick={() => setSelectedMenu(item.key)}
                                      >
                                          <item.icon className="w-5 h-5 mr-3" />
                                          {item.name}
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      </nav>
                  </aside>

                  {/* 메인 콘텐츠 영역 (선택된 컴포넌트 표시) */}
                  <main className="w-full lg:w-3/4 min-h-[500px] bg-white rounded-xl p-0">
                      {ContentComponent}
                  </main>
              </div>
          </div>
      </div>
  );
};

export default MyPage;