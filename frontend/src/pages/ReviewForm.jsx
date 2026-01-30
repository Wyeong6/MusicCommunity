import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx'; 
import { Star, PenLine, AlertCircle, ChevronLeft, Calendar } from 'lucide-react';

const ReviewForm = () => {
    const { userId } = useAuth(); // 로그인된 사용자 ID
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [eventId, setEventId] = useState(''); // 선택된 공연 ID
    const [myEvents, setMyEvents] = useState([]); // 예약 목록 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 1. 사용자 예약 목록 불러오기 (작성하신 API 호출)
    useEffect(() => {
        const fetchMyReservations = async () => {
            try {
                // 백엔드: GET /api/reservations/user/{userId} 호출
                const response = await axios.get(`http://localhost:8080/api/reservations/user/${userId}`);
                
                // Mapper에서 정의한 status가 'COMPLETE'인 예약만 필터링
                const completedEvents = response.data.filter(res => res.status === 'COMPLETE');
                setMyEvents(completedEvents);
            } catch (err) {
                console.error("예약 목록 조회 실패", err);
                setError("예약 내역을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchMyReservations();
    }, [userId]);

    // 2. 후기 제출 로직
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!eventId) return alert("리뷰를 남길 공연을 선택해주세요.");

        try {
            const reviewData = {
                userId: userId,
                eventId: eventId, // 셀렉트 박스에서 선택된 E_ID
                title: title,
                content: content,
                rating: rating
            };

            await axios.post('http://localhost:8080/api/reviews', reviewData);
            alert("후기가 등록되었습니다!");
            navigate('/reviews'); 
        } catch (err) {
            setError(err.response?.data || "등록 중 오류가 발생했습니다.");
        }
    };

    if (loading) return <div className="p-10 text-center">관람 내역 확인 중...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-6 hover:text-teal-600">
                <ChevronLeft size={20} /> 뒤로가기
            </button>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-teal-600 p-6 text-white text-center">
                    <h2 className="text-2xl font-bold flex justify-center items-center">
                        <PenLine className="mr-2" /> 공연 후기 작성
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm">
                            <AlertCircle size={16} className="mr-2" /> {error}
                        </div>
                    )}

                    {/* 공연 선택 (핵심 부분!) */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">관람한 공연 선택</label>
                        <select 
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                            required
                        >
                            <option value="">후기를 작성할 공연을 골라주세요</option>
                            {myEvents.map((res) => (
                                <option key={res.id} value={res.eventId}>
                                    {res.eventName} (관람일: {new Date(res.reservationDate).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                        {myEvents.length === 0 && (
                            <p className="text-sm text-orange-500 mt-2 italic">
                                * 관람 완료된 공연 내역이 없습니다.
                            </p>
                        )}
                    </div>

                    {/* 별점 선택 */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">평점</label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <Star 
                                    key={num}
                                    size={30}
                                    className="cursor-pointer transition"
                                    fill={rating >= num ? "#FBBF24" : "none"}
                                    color={rating >= num ? "#FBBF24" : "#D1D5DB"}
                                    onClick={() => setRating(num)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 제목 및 내용 */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">제목</label>
                        <input 
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-bold mb-2">내용</label>
                        <textarea 
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                            rows="5"
                            placeholder="공연의 감동을 기록해보세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={myEvents.length === 0}
                        className={`w-full p-4 rounded-xl font-bold text-white shadow-lg transition ${
                            myEvents.length === 0 ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'
                        }`}
                    >
                        후기 등록 완료
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;