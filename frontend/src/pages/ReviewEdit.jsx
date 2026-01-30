import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Save, Star } from 'lucide-react';

const ReviewEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId: currentUserId } = useAuth();


    const [formData, setFormData] = useState({
        title: '',
        content: '',
        rating: 5,
        eventTitle: '' // 사용자에게 어떤 공연 수정인지 보여주기 용도
    });

    // 1. 기존 데이터 불러오기
    useEffect(() => {
        const fetchOriginalReview = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/reviews/${id}`);
                const data = response.data;

                // 본인 확인 (보안 강화)
                if (Number(currentUserId) !== Number(data.userId)) {
                    alert("수정 권한이 없습니다.");
                    navigate(`/reviews/${id}`);
                    return;
                }

                setFormData({
                    title: data.title,
                    content: data.content,
                    rating: data.rating,
                    eventTitle: data.eventTitle
                });
            } catch (err) {
                console.error("데이터 로드 실패:", err);
                navigate('/reviews');
            }
        };
        if (currentUserId) fetchOriginalReview();
    }, [id, currentUserId, navigate]);

    // 2. 수정 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/api/reviews/${id}`, {
                ...formData,
                userId: currentUserId // Mapper에서 본인 확인용으로 사용됨
            });
            alert("수정이 완료되었습니다.");
            navigate(`/reviews/${id}`); // 수정 후 상세 페이지로 이동
        } catch (err) {
            alert("수정 실패: " + err.response?.data || "서버 오류");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 text-white">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 mb-6 hover:text-white transition">
                <ChevronLeft size={20} /> 취소하고 돌아가기
            </button>

            <h2 className="text-3xl font-bold mb-8 flex items-center">
                후기 수정 <span className="ml-3 text-sm font-normal text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full">{formData.eventTitle}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[#1e293b] p-8 rounded-3xl border border-gray-700 shadow-xl">
                {/* 별점 선택 */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">만족도</label>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setFormData({ ...formData, rating: num })}
                                className="transition-transform hover:scale-110"
                            >
                                <Star 
                                    size={32} 
                                    fill={formData.rating >= num ? "#FBBF24" : "none"} 
                                    color={formData.rating >= num ? "#FBBF24" : "#4b5563"} 
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 제목 입력 */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">제목</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                </div>

                {/* 본문 입력 */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">상세 후기</label>
                    <textarea
                        required
                        rows="10"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center"
                >
                    <Save size={20} className="mr-2" /> 수정 내용 저장하기
                </button>
            </form>
        </div>
    );
};

export default ReviewEdit;