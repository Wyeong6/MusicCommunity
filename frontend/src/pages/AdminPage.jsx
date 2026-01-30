import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { 
  PlusCircle, XCircle, Loader, ShieldAlert, 
  Calendar, MapPin, Clock, List, Pencil, 
  Users, Image, Maximize,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 백엔드 API 호출을 위한 기본 설정
const API_BASE_URL = "/api/events"; 

const AdminPage = () => {
  // useAuth 훅을 통해 현재 사용자 정보와 역할을 가져옵니다.
  const { userRole } = useAuth();
  const isAdmin = userRole;

  const [events, setEvents] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // [수정 1] DTO 카멜 케이스 필드명에 맞춰 상태 정의 (예: total_seat -> totalSeats)
  const [newEvent, setNewEvent] = useState({
    title: '',
    venue: '', // vanue -> venue
    startDate: '', // start_date -> startDate
    endDate: '', // end_date -> endDate
    runtimeMinutes: '', // runtime_minutes -> runtimeMinutes
    ageRestriction: '', // age_restriction -> ageRestriction
    posterUrl: '', // poster_url -> posterUrl
    totalSeats: '', // total_seat -> totalSeats
    description: '',
  });

  // --- 1. 이벤트 목록 로드 (Axios 사용) ---
  useEffect(() => {
    const fetchEvents = async () => {
      if (!isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(API_BASE_URL);
        setEvents(response.data);
        console.log("이벤트 목록 로드 성공:", response.data);

      } catch (err) {
        console.error("이벤트 로드 실패:", err);
        if (err.response) {
            setError(`서버 오류: ${err.response.status} - ${err.response.statusText}`);
        } else {
            setError("네트워크 오류 또는 요청 설정 중 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isAdmin]);

  
  // --- 2. 입력 필드 변경 핸들러 (ID와 상태 필드명 일치) ---
  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewEvent(prev => ({ ...prev, [id]: value }));
  };

  // --- 3. 새 이벤트 추가 핸들러 ---
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; 

    setLoading(true);
    setError(null);

    // 유효성 검사 (수정된 필드명: venue, startDate, totalSeats)
    if (!newEvent.title || !newEvent.venue || !newEvent.startDate || !newEvent.totalSeats) {
        setError("필수 항목(제목, 장소, 시작일, 총 좌석 수)을 입력해주세요.");
        setLoading(false);
        return;
    }
    
    // TODO: 실제 API 호출 로직 (POST /api/events)
    try {

        const payload = {
                ...newEvent,
                runtimeMinutes: newEvent.runtimeMinutes ? Number(newEvent.runtimeMinutes) : 0,
                totalSeats: Number(newEvent.totalSeats),
                // startDate, endDate는 input type="date"에서 "YYYY-MM-DD" 문자열로 오므로 그대로 전송 가능
                // (백엔드 DTO가 java.sql.Date 혹은 String으로 잘 받는다고 가정)
              };


              const response = await axios.post(`${API_BASE_URL}/update`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
              });

              console.log('서버 응답:', response.data);

              // 성공 시: 서버가 반환한 저장된 객체(ID 포함)를 목록에 추가
                setEvents(prev => [response.data, ...prev]);

                                // 폼 초기화
                setNewEvent({ 
                        title: '', venue: '', startDate: '', endDate: '', 
                        runtimeMinutes: '', ageRestriction: '', posterUrl: '', 
                        totalSeats: '', description: '' 
                });

                alert("이벤트와 좌석이 성공적으로 생성되었습니다!");


    } catch (err) {
        console.error("이벤트 등록 실패:", err);
        // 에러 메시지 상세 표시
        const errMsg = err.response?.data?.message || err.message || '이벤트 추가 중 알 수 없는 오류가 발생했습니다.';
        setError(errMsg);    
        } finally {
      setLoading(false);
    }
  };
  
// --- 4. 이벤트 상태 변경 핸들러 (취소 및 복구 공통 사용 가능) ---
const changeEventStatus = async (eventId, newStatus) => {
  if (!isAdmin) return;

  const actionText = newStatus === 'CANCELED' ? "취소" : "복구";
  if (!window.confirm(`정말로 이 이벤트를 ${actionText}하시겠습니까?`)) {
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // [중요] URL 뒤에 ?status=CANCELED 또는 ?status=ACTIVE 를 붙여야 합니다.
    await axios.patch(`${API_BASE_URL}/${eventId}/status?status=${newStatus}`);

    // 성공 시: 로컬 state 업데이트
    setEvents(prev => prev.map(e => 
      e.id === eventId ? { ...e, status: newStatus } : e
    ));

    alert(`이벤트가 성공적으로 ${actionText}되었습니다.`);

  } catch (err) {
    console.error(`이벤트 ${actionText} 실패:`, err);
    const errMsg = err.response?.data?.message || err.message || '상태 변경 중 오류가 발생했습니다.';
    setError(errMsg);
  } finally {
    setLoading(false);
  }
};

// 기존 함수들을 위 공통 함수를 호출하도록 변경
const handleCancelEvent = (eventId) => changeEventStatus(eventId, 'CANCELED');
const handleRestoreEvent = (eventId) => changeEventStatus(eventId, 'ACTIVE');


  // --- 관리자 권한 체크 ---
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">접근 권한 없음</h1>
        <p className="text-gray-600 mt-2">이 페이지는 관리자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  // --- 헬퍼 함수: 날짜 포맷팅 ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // DATE 타입이므로 시간 정보는 제외하고 날짜만 표시
        // ISO 8601 형식 (YYYY-MM-DDTHH:mm:ss.sssZ)에서 날짜만 추출
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
        return dateString; // 유효하지 않은 포맷일 경우 원본 반환
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-['Inter']">
      <style>{`
        /* date input calendar icon fix */
        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: auto;
          height: auto;
          color: transparent;
          background: transparent;
          cursor: pointer;
        }
      `}</style>

      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-indigo-600 pb-2">
        관리자 페이지: 이벤트 관리
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
          <p className="font-bold">오류 발생</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* --------------------- 1. 새 이벤트 등록 섹션 --------------------- */}
      <section className="bg-white p-6 rounded-xl shadow-2xl mb-10">
        <h2 className="text-2xl font-bold text-indigo-700 flex items-center mb-6 border-b pb-2">
          <PlusCircle className="w-6 h-6 mr-2" /> 새 이벤트 등록 (DTO 필드명 맞춤)
        </h2>
        <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         
          {/* Row 1: Title, Venue, Total Seats */}
          <div className="lg:col-span-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목 (필수)</label>
            <div className="relative">
              <Pencil className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="title" type="text" value={newEvent.title} onChange={handleChange} 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="이벤트 제목" required />
            </div>
          </div>

          {/* [수정 4] vanue -> venue */}
          <div className="lg:col-span-1">
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">장소/Venue (필수)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="venue" type="text" value={newEvent.venue} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="공연 장소 (venue)" required />
            </div>
          </div>

          {/* [수정 5] total_seat -> totalSeats */}
          <div className="lg:col-span-1">
            <label htmlFor="totalSeats" className="block text-sm font-medium text-gray-700 mb-1">총 좌석 수 (필수)</label>
            <div className="relative">
              <Maximize className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="totalSeats" type="number" value={newEvent.totalSeats} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="총 좌석 수 (totalSeats)" required min="1" />
            </div>
          </div>
          
          {/* Row 2: Dates and Runtime */}
          {/* [수정 6] start_date -> startDate */}
          <div className="lg:col-span-1">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">시작일 (DATE)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input id="startDate" type="date" value={newEvent.startDate} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                required />
            </div>
          </div>

          {/* [수정 7] end_date -> endDate */}
          <div className="lg:col-span-1">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">종료일 (DATE)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input id="endDate" type="date" value={newEvent.endDate} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
            </div>
          </div>
          
          {/* [수정 8] runtime_minutes -> runtimeMinutes */}
          <div className="lg:col-span-1">
            <label htmlFor="runtimeMinutes" className="block text-sm font-medium text-gray-700 mb-1">런타임 (분)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="runtimeMinutes" type="number" value={newEvent.runtimeMinutes} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="런타임 (분)" min="0" />
            </div>
          </div>

          {/* Row 3: Age and Poster */}
          {/* [수정 9] age_restriction -> ageRestriction */}
          <div className="lg:col-span-1">
            <label htmlFor="ageRestriction" className="block text-sm font-medium text-gray-700 mb-1">연령 제한</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="ageRestriction" type="text" value={newEvent.ageRestriction} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="예: 15세 이상" />
            </div>
          </div>

          {/* [수정 10] poster_url -> posterUrl */}
          <div className="lg:col-span-2">
            <label htmlFor="posterUrl" className="block text-sm font-medium text-gray-700 mb-1">포스터 URL</label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="posterUrl" type="url" value={newEvent.posterUrl} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="포스터 이미지 링크 (posterUrl)" />
            </div>
          </div>

          {/* Description (Full Width) */}
          <div className="col-span-full">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">설명 (내부용)</label>
            <div className="relative">
              <List className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea id="description" value={newEvent.description} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="이벤트 상세 설명을 입력하세요" rows="3" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-full pt-2">
            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 text-base font-medium rounded-lg shadow-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <PlusCircle className="w-5 h-5 mr-2" />
              )}
              {loading ? '등록 중...' : '이벤트 등록 완료'}
            </button>
          </div>
        </form>
      </section>

      {/* --------------------- 2. 이벤트 목록 관리 섹션 --------------------- */}
      <section className="bg-white p-6 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-indigo-700 flex items-center mb-6 border-b pb-2">
          <Pencil className="w-6 h-6 mr-2" /> 등록 이벤트 관리 목록
        </h2>
        
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">제목</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">장소</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">날짜</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">좌석수</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">연령</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">상태</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">조치</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className={event.status === 'CANCELLED' ? 'bg-red-50 opacity-80' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{event.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{event.title}</td>
                  {/* [수정 11] vanue -> venue */}
                  <td className="px-4 py-3 text-sm text-gray-700">{event.venue}</td> 
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    <div className='flex flex-col'>
                      {/* [수정 12] start_date -> startDate */}
                      <span className='font-semibold'>S: {formatDate(event.startDate)}</span> 
                      {/* [수정 13] end_date -> endDate */}
                      <span className='text-xs text-gray-500'>E: {formatDate(event.endDate)}</span> 
                    </div>
                  </td>
                  {/* [수정 14] total_seat -> totalSeats (안전장치 || 0 추가) */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">
                    {(event.totalSeats || 0).toLocaleString()}석
                  </td>
                  {/* [수정 15] age_restriction -> ageRestriction */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{event.ageRestriction || '정보 없음'}</td> 
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {event.status === 'ACTIVE' ? '운영 중' : '취소됨'}
                    </span>
                  </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {event.status === 'ACTIVE' ? (
                        <button onClick={() => handleCancelEvent(event.id)} className="...">
                          <XCircle className="w-4 h-4 mr-1" /> 취소
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleRestoreEvent(event.id)} // 복구 함수 호출
                          className="inline-flex items-center px-3 py-1 text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm transition"
                        >
                          <PlusCircle className="w-4 h-4 mr-1" /> 복구
                        </button>
                      )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* 개발자 디버깅용 정보 */}
      <div className='mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-gray-700'>
        <p>현재 로그인 사용자 역할: <span className='font-bold text-yellow-800'>{userRole || 'Guest'}</span></p>
      </div>
    </div>
  );
};

export default AdminPage;