import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Calendar, Music, XCircle, CheckCircle, MapPin, Clock, Armchair, Ticket} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/users';

// 예약 목록을 표시하는 컴포넌트입니다.
/**
 * 예약 목록을 표시하고 백엔드 API를 호출하는 컴포넌트입니다.
 */
const ReservationList = () => {
    const { userId } = useAuth(); 

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            if (loading) return; 
            setError("사용자 ID를 찾을 수 없습니다. 로그인이 필요합니다.");
            setLoading(false);
            return;
        }

        const fetchReservations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/mypage/${userId}/reservations`, {
                    withCredentials: true,
                });
                
                // 💡 응답이 빈 배열이 아닌 경우에도, 데이터가 유효한지 확인하고 설정합니다.
                if (Array.isArray(response.data)) {
                    setReservations(response.data);
                } else {
                    // 데이터 형식이 예상과 다를 경우 처리
                    setError("예약 목록 데이터 형식이 올바르지 않습니다.");
                    setReservations([]);
                }
            } catch (err) {
                if (err.response) {
                    const status = err.response.status;
                    if (status === 401 || status === 403) {
                        setError("인증 또는 권한 오류가 발생했습니다. 다시 로그인해주세요.");
                    } else if (status === 404) {
                        setError("서버에서 요청한 정보를 찾을 수 없습니다.");
                    } else {
                        setError(`예약 목록을 불러오는 중 서버 오류가 발생했습니다. (Code: ${status})`);
                    }
                } else {
                    setError("네트워크 오류가 발생했습니다. 서버 연결을 확인해주세요.");
                }
                console.error("예약 목록 로드 오류:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();

    }, [userId]);

    // --- 예약 상태 스타일 헬퍼 ---
    const getStatusStyle = (status) => {
        switch ((status || 'UNKNOWN').toUpperCase()) {
            // COMPLETE 상태를 확정으로 간주
            case 'COMPLETE': 
            case 'CONFIRMED': return { text: '결제/예약 완료', style: 'bg-green-100 text-green-700 border-green-300' };
            case 'PENDING': return { text: '승인 대기', style: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
            case 'CANCELLED': return { text: '예약 취소', style: 'bg-red-100 text-red-700 border-red-300' };
            default: return { text: '상태 불명', style: 'bg-gray-100 text-gray-700 border-gray-300' };
        }
    };

    // ISO 날짜 문자열을 (YYYY-MM-DD)와 (HH:MM)으로 분리하는 헬퍼 함수
    const formatDateTime = (isoDateString) => {
        if (!isoDateString) return { date: '날짜 미정', time: '시간 미정' };
        try {
            // T를 기준으로 날짜와 시간 부분을 분리합니다.
            const [datePart, timeWithSeconds] = isoDateString.split('T');
            if (!datePart || !timeWithSeconds) throw new Error("Invalid ISO format");
            
            // 시간 부분에서 초와 밀리초를 제거하고 시:분만 남깁니다.
            const timePart = timeWithSeconds.substring(0, 5); // HH:MM
            
            return { date: datePart, time: timePart };
        } catch (e) {
            console.error("날짜 포맷팅 오류:", e);
            return { date: isoDateString, time: '시간 정보 오류' };
        }
    };
    
    // --- 렌더링 상태 처리 (로딩/에러/목록 없음) ---
    // (로딩 및 에러 처리 부분은 동일하게 유지)
    if (loading) {
        return (
            <div className="flex justify-center items-center p-10 text-indigo-500 min-h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <p className="ml-4">예약 목록을 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-400 text-red-700 rounded-xl shadow-md flex items-center min-h-[500px] justify-center">
                <XCircle className="w-6 h-6 mr-3" />
                <p className="text-lg font-medium">{error}</p>
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-xl shadow-inner border border-dashed border-gray-300 min-h-[500px] flex flex-col justify-center">
                <Music className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-xl font-medium">예약된 일정이 없습니다.</p>
                <p className="text-sm mt-1">지금 바로 이벤트를 예매해보세요!</p>
            </div>
        );
    }

    // --- 예약 목록 표시 ---

    return (
        <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 border-b pb-3">나의 예약 목록 ({reservations.length}건)</h2>
            {reservations.map((res, index) => {
                const statusInfo = getStatusStyle(res.status);
                
                // 💡 수정: 이벤트 이름 (eventName) 사용
                const displayEventName = res.eventName || `예약 #${res.id || index + 1}`;
                const displayReservationId = res.id || 'N/A';
                
                // 💡 수정: 이벤트 날짜 (eventDate)를 포맷팅하여 사용
                const { date: eventDateOnly, time: eventTimeOnly } = formatDateTime(res.eventDate);
                
                // 💡 예약 생성 날짜 (reservationDate)는 하단에 작게 표시
                const { date: createdDate, time: createdTime } = formatDateTime(res.reservationDate);

                return (
                    <div key={index} className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 hover:border-indigo-400 transition duration-300">
                        <div className="flex justify-between items-start mb-4 border-b pb-2">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                {/* 💡 아이콘 변경: 티켓 아이콘 사용 */}
                                <Ticket className="w-5 h-5 mr-2 text-indigo-600" /> 
                                {displayEventName}
                            </h3>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full border shadow-sm ${statusInfo.style}`}>
                                {statusInfo.text}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-gray-700">
                            {/* 💡 공연 날짜 */}
                            <p className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-500" /> 
                                <span className="font-medium mr-1">공연 날짜:</span> {eventDateOnly}
                            </p>
                            {/* 💡 공연 시간 */}
                            <p className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-500" /> 
                                <span className="font-medium mr-1">공연 시간:</span> {eventTimeOnly}
                            </p>
                            {/* 💡 좌석 정보 */}
                            <p className="flex items-center col-span-2">
                                <Armchair className="w-4 h-4 mr-2 text-gray-500" /> 
                                <span className="font-medium mr-1">좌석 정보:</span> {res.seatInfo || '좌석 정보 없음'}
                            </p>
                        </div>

                        {/* 추가 정보 섹션 */}
                        <div className="text-sm text-gray-500 pt-3 mt-3 border-t">
                             <p>
                                예약 ID: <span className="font-mono ml-1 mr-4">{displayReservationId}</span>
                                예약 생성일: <span className="font-mono ml-1">{createdDate} {createdTime}</span>
                            </p>
                            {res.totalPrice && (
                                <p className="mt-1">
                                    총 금액: <span className="font-medium text-gray-800 ml-1">{res.totalPrice.toLocaleString()} 원</span>
                                </p>
                            )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex space-x-3">
                            <button className="text-sm py-2 px-4 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition shadow-md">
                                상세 내역
                            </button>
                            {statusInfo.text !== '결제/예약 완료' && ( // 완료 상태가 아니면 취소 버튼 표시
                                <button className="text-sm py-2 px-4 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition shadow-md">
                                    예약 취소 요청
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReservationList;