import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { MapPin, Calendar, Ticket, Loader2, AlertTriangle, User, ServerOff } from 'lucide-react';
import { useAuth } from './context/AuthContext';

// =================================================================
// EventCard 컴포넌트 (UI와 로직 분리)
// =================================================================
// EventCard 컴포넌트는 isLoggedIn prop을 계속 받거나, 내부에서 useAuth()를 사용할 수 있지만,
// Home 컴포넌트에서 이미 isLoggedIn을 가져와 props로 전달하는 것이 현재 구조상 더 간단합니다.
// 여기서는 변경 없이 기존 props 방식을 유지합니다.

const EventCard = ({ event, handleReserveClick, isLoggedIn }) => {
    const eventId = event.id;
    const title = event.title;
    const remaining = event.availableSeats ?? 0; 
    const total = event.totalSeats ?? 0; 
    const isSoldOut = remaining <= 0;

    console.log('event : ', event);
    
    // 예매 버튼 활성화 조건: 로그인 됨 && 매진 아님
    const isReservable = isLoggedIn && !isSoldOut;

    // 날짜 포맷팅 (ISO 8601 문자열을 한국 시간으로 변환)
    const formattedDate = new Date(event.startDate).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div 
            key={eventId} 
            className="bg-gray-800 p-6 rounded-xl shadow-2xl transition duration-300 ease-in-out hover:shadow-cyan-500/50 hover:bg-gray-700/70 transform hover:scale-[1.01]"
        >
            {/* 이벤트 정보 */}
            <h3 className="text-2xl font-bold mb-3 text-cyan-400 border-b border-gray-600 pb-2">
                {title}
            </h3>
            
            <div className="space-y-2 text-sm text-gray-300 mb-4">
                <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-indigo-300 flex-shrink-0" />
                    장소: <span className="font-semibold ml-1">{event.venue || '미정'}</span>
                </p>
                <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-300 flex-shrink-0" />
                    일시: <span className="font-semibold ml-1">{formattedDate}</span>
                </p>
                <p className="flex items-center">
                    <Ticket className="w-4 h-4 mr-2 text-indigo-300 flex-shrink-0" />
                    남은 좌석: 
                    <span className={`font-extrabold text-lg ml-1 ${isSoldOut ? 'text-red-400' : 'text-green-400'}`}>
                        {remaining}
                    </span> 
                    / {total}
                </p>
            </div>
            
            {/* 예매 버튼 영역 */}
            <div className="mt-6">
                {!isReservable ? (
                    // 매진이거나 로그인이 안 된 경우 (비활성화 상태)
                    <button 
                        className={`w-full py-3 mt-2 font-bold rounded-lg cursor-not-allowed shadow-md transition duration-200 ${
                            isSoldOut 
                            ? 'bg-gray-600 text-gray-400 opacity-70' // 매진
                            : 'bg-yellow-600 text-white opacity-90' // 로그인 필요
                        }`}
                        disabled
                    >
                        <span className="flex items-center justify-center">
                            {isSoldOut ? (
                                <>
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    매진 (SOLD OUT)
                                </>
                            ) : (
                                <>
                                    <User className="w-5 h-5 mr-2" />
                                    로그인 후 예매 가능
                                </>
                            )}
                        </span>
                    </button>
                ) : (
                    // 로그인 됨 + 예매 가능한 경우 (활성화 상태)
                    <button 
                        onClick={() => handleReserveClick(eventId)} // 팝업 로직 호출
                        className="w-full py-3 mt-2 bg-gray-600 from-cyan-600 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-blue-400 transition duration-200 shadow-xl hover:shadow-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50"
                    >
                        예매하기 (좌석 선택)
                    </button>
                )}
            </div>
        </div>
    );
};

// =================================================================
// Home 컴포넌트
// =================================================================

function Home() { 
    // Context에서 isLoggedIn 상태를 가져옵니다.
    const { isLoggedIn } = useAuth(); 
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 백엔드 EventController의 /api/events 엔드포인트 호출
            const response = await axios.get('/api/events');
            setEvents(response.data); 
        } catch (err) {
            console.error("Failed to fetch events:", err);
            setError('이벤트 정보를 불러오는 데 실패했습니다. 서버 상태를 확인하거나 네트워크 연결을 확인하세요.');
            
            // API 호출 실패 시 임시 데이터 (DTO 필드명에 맞춤) - **테스트용으로 남겨둡니다.**
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // 1. 초기 마운트 시 데이터 로딩 시작 (스크롤 복원 방지 1차 시도)
    useEffect(() => {
        // 최초 마운트 시 스크롤을 한 번 초기화
        fetchEvents();
    }, []); 

        // 2. 로딩 완료 시: DOM 크기 변화로 인한 자동 스크롤을 덮어쓰기 위해 최종 보정
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                window.scrollTo(0, 0);
            }, 0); 
            return () => clearTimeout(timer); // 클린업 함수
        }
    }, [isLoading]);

    const handleReserveClick = (eventId) => {
        if (!isLoggedIn) return;
    
        const width = 800;
        const height = 900;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
    
        // 1) 먼저 빈 팝업을 "사용자 제스처 안에서" 열어서 trusted window 보장
        const popup = window.open(
            "",
            `reservation_popup_${eventId}`,
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
    
        if (!popup) {
            alert("팝업 차단이 감지되었습니다. 브라우저 설정에서 팝업을 허용해주세요.");
            return;
        }
    
        // 2) trusted window 확보 후 로케이션 변경
        popup.location.href = `/events/${eventId}`;
    
        // 3) 팝업 닫힘 감지
        const timer = setInterval(() => {
            if (popup.closed) {
                clearInterval(timer);
                fetchEvents();
            }
        }, 400);
    };
    

    // [중요 수정] 화면에 그리기 전에 'ACTIVE' 상태인 이벤트만 필터링합니다.
    // status가 null이거나 undefined일 경우를 대비해 안전하게 체크합니다.
    const activeEvents = events.filter(event => event.status === 'ACTIVE');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="flex items-center text-cyan-400">
                    <Loader2 className="w-8 h-8 mr-3 animate-spin" />
                    <span className="text-xl font-medium">이벤트 목록을 불러오는 중...</span>
                </div>
            </div>
        );
    }

    if (error && events.length === 0) { // 임시 데이터도 없을 때만 오류 화면 표시
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
              <div className="bg-red-900/50 p-8 rounded-xl text-red-300 text-center shadow-2xl">
                <ServerOff className="w-10 h-10 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">서버 연결 오류</h2>
                <p>{error}</p>
                <button 
                  onClick={fetchEvents}
                  className="mt-4 bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-300"
                >
                  다시 시도
                </button>
              </div>
            </div>
        );
    }

    return (
        <div className="py-8 min-h-screen bg-gray-900">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight text-center">
                    현재 진행 및 예정 이벤트 <span className="text-yellow-400">🎟️</span>
                </h2> 
                <p className="text-gray-400 mb-12 text-center text-lg">
                    좌석 예매가 가능한 이벤트를 확인하고 티켓을 예매하세요!
                </p>
                
                {/* [중요 수정] activeEvents 길이를 체크하고, map도 activeEvents로 돌립니다 */}
                {activeEvents.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/50 rounded-xl">
                        <h2 className="text-3xl font-semibold text-gray-400 mb-2">진행 중인 이벤트가 없습니다.</h2>
                        <p className="text-gray-500">새로운 이벤트가 곧 등록될 예정입니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {activeEvents.map(event => (
                            <EventCard 
                                key={event.id} // event.id로 수정 (DTO 필드명 확인 필요)
                                event={event} 
                                handleReserveClick={handleReserveClick} 
                                isLoggedIn={isLoggedIn}
                            />
                        ))}
                    </div>
                )}
            </div>
            <footer className="mt-16 text-center text-gray-500">
                <p>&copy; 2025 MUSICCOMMUNITY. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Home;
