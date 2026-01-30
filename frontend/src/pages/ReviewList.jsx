import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Star, User, Eye, Calendar, PenLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { maskId } from '../utils/formatters';

const ReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { userId: currentUserId } = useAuth();

    // 1. 데이터 가져오기
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/reviews');
                console.log("리뷰데이터", response.data);
                console.log("currentUserId", currentUserId);

                setReviews(response.data);
            } catch (error) {
                console.error("후기를 불러오는 데 실패했습니다.", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    // 별점 렌더링 함수 (예: 4점이면 꽉 찬 별 4개, 빈 별 1개)
    const renderStars = (rating) => {
        return (
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < rating ? "currentColor" : "none"} />
                ))}
            </div>
        );
    };

    if (loading) return <div className="p-10 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* 상단 헤더 */}
            <div className="flex justify-between items-center mb-8 border-b-2 border-teal-500 pb-4">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <MessageSquare className="mr-2 text-teal-600" /> 공연 후기 게시판
                </h2>
                <button 
                        onClick={() => {
                            if (!currentUserId) {
                                alert("로그인이 필요한 서비스입니다.");
                                navigate('/login'); // 로그인 페이지로 유도
                                return;
                            }
                            navigate('/reviews/create');
                        }}                    
                        className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition shadow-md"
                >
                    <PenLine size={18} className="mr-2" /> 후기 작성하기
                </button>
            </div>

            {/* 후기 목록 그리드 */}
            {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                        <div 
                            key={review.id} 
                            onClick={() => navigate(`/reviews/${review.id}`)}
                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                {/* 공연 제목 배지 */}
                                <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded mb-3">
                                    {review.eventTitle}
                                </span>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                                    {review.title}
                                </h3>
                                <div className="mb-4">
                                    {renderStars(review.rating)}
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                    {review.content}
                                </p>
                            </div>

                            {/* 하단 정보 섹션 */}
                            <div className="border-t pt-4 flex justify-between items-center text-xs text-gray-500">
                                <div className="flex items-center space-x-3">
                                    <span className="flex items-center"><User size={14} className="mr-1"/> {review.nickname}({maskId(review.userLoginId)})</span>
                                    <span className="flex items-center"><Eye size={14} className="mr-1"/> {review.viewCount}</span>
                                </div>
                                <span className="flex items-center">
                                    <Calendar size={14} className="mr-1"/> {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    첫 번째 후기의 주인공이 되어보세요!
                </div>
            )}
        </div>
    );
};

export default ReviewList;