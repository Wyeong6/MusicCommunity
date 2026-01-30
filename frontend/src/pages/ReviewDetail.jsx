import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { maskId } from '../utils/formatters';

import { 
    ChevronLeft, Star, Calendar, User, Eye, 
    Music, MessageSquare, AlertCircle, Edit, Trash2, Send, X, Check
} from 'lucide-react';

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId: currentUserId, authLoading } = useAuth();
    
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // --- 댓글 관련 상태 ---
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- ✨ 추가된 수정 관련 상태 ---
    const [editingCommentId, setEditingCommentId] = useState(null); // 어떤 댓글을 수정 중인지 저장
    const [editContent, setEditContent] = useState(""); // 수정 중인 텍스트 내용

    const fetchComments = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/comments/review/${id}`);
            setComments(response.data);
        } catch (err) {
            console.error("댓글 로딩 실패:", err);
        }
    }, [id]);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/reviews/${id}`);
                console.log("전체 댓글 데이터:", response.data);
                setReview(response.data);
                await fetchComments();
            } catch (err) {
                console.error("데이터 로딩 실패:", err);
                alert("게시글을 불러올 수 없습니다.");
                navigate('/reviews');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate, fetchComments]);

    // 댓글 등록
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentContent.trim()) return;
        if (!currentUserId) { alert("로그인이 필요합니다."); return; }

        setIsSubmitting(true);
        try {
            await axios.post(`http://localhost:8080/api/comments`, {
                reviewId: id,
                userId: currentUserId,
                content: commentContent
            });
            setCommentContent("");
            fetchComments();
        } catch (err) {
            alert("댓글 등록 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- ✨ 추가된 댓글 수정 로직 ---
    const handleEditStart = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
    };

    const handleEditCancel = () => {
        setEditingCommentId(null);
        setEditContent("");
    };

    const handleEditSubmit = async (commentId) => {
        if (!editContent.trim()) return;
        try {
            await axios.put(`http://localhost:8080/api/comments/${commentId}`, {
                userId: currentUserId,
                content: editContent
            });
            setEditingCommentId(null);
            alert("댓글이 수정되었습니다."); // 알림창 추가
            fetchComments(); 
        } catch (err) {
            alert("수정 권한이 없거나 오류가 발생했습니다.");
        }
    };

    // 댓글 삭제
    const handleCommentDelete = async (commentId) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/comments/${commentId}`, {
                params: { userId: currentUserId }
            });
            alert("댓글이 삭제되었습니다."); // 알림창 추가
            fetchComments(); 
        } catch (err) {
            alert("삭제 권한이 없거나 오류가 발생했습니다.");
        }
    };

    // 후기 삭제
    const handleDelete = async () => {
        if (!window.confirm("정말로 이 후기를 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/reviews/${id}`);
            alert("후기가 삭제되었습니다.");
            navigate('/reviews');
        } catch (err) {
            alert("삭제 실패");
        }
    };

    if (authLoading || loading) {
        return <div className="min-h-screen flex justify-center items-center text-teal-400 font-bold">데이터를 불러오는 중...</div>;
    }
    if (!review) return null;

    const isAuthor = currentUserId && Number(currentUserId) === Number(review.userId);
    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // 24시간 형식 (오전/오후가 좋으시면 true로 바꾸세요!)
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:py-12">
            {/* 상단 네비게이션 및 액션 버튼 */}
            <div className="flex justify-between items-center mb-8">
                <button 
                    onClick={() => navigate('/reviews')} 
                    className="flex items-center text-gray-400 hover:text-white transition-colors font-medium group"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    목록으로 돌아가기
                </button>

                {isAuthor && (
                    <div className="flex space-x-2">
                        <button onClick={() => navigate(`/reviews/edit/${id}`)} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm transition-all"><Edit size={16} className="mr-2" /> 수정</button>
                        <button onClick={handleDelete} className="flex items-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-sm border border-red-500/20 transition-all"><Trash2 size={16} className="mr-2" /> 삭제</button>
                    </div>
                )}
            </div>

            {/* 메인 게시글 카드 */}
            <div className="bg-[#1e293b] rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden mb-10">
                <div className="p-8 md:p-12 border-b border-gray-700/50 bg-slate-800/40">
                    <div className="flex items-center mb-6">
                        <span className="bg-teal-500/10 text-teal-400 px-4 py-1.5 rounded-full text-xs font-bold border border-teal-500/20 flex items-center">
                            <Music size={14} className="mr-2" /> {review.eventTitle}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8 leading-tight">{review.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
                        <div className="flex items-center bg-gray-900/40 px-3 py-1.5 rounded-lg"><User size={16} className="mr-2 text-teal-500" /><span className="text-gray-200 font-medium">{review.nickname}({maskId(review.userLoginId)})</span></div>
                        <div className="flex items-center"><Calendar size={16} className="mr-2 opacity-60" />{formatDate(review.createdAt)}</div>
                        <div className="flex items-center"><Eye size={16} className="mr-2 opacity-60" />조회 {review.viewCount}</div>
                        <div className="flex items-center md:ml-auto">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <Star key={num} size={18} fill={review.rating >= num ? "#FBBF24" : "none"} color={review.rating >= num ? "#FBBF24" : "#4b5563"} className="mr-0.5"/>
                            ))}
                            <span className="ml-2 text-yellow-500 font-bold">{review.rating}.0</span>
                        </div>
                    </div>
                </div>
                <div className="p-8 md:p-12 bg-[#1e293b]">
                    <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap min-h-[200px]">{review.content}</div>
                </div>
                <div className="px-8 py-4 bg-black/20 flex justify-between items-center border-t border-gray-700/30">
                    <div className="flex items-center text-gray-500 text-xs"><MessageSquare size={14} className="mr-2" />솔직한 후기는 유저들에게 큰 도움이 됩니다.</div>
                    <button className="flex items-center text-gray-500 hover:text-red-400 transition-colors text-xs"><AlertCircle size={14} className="mr-1" /> 신고하기</button>
                </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <MessageSquare className="mr-2 text-teal-400" size={24} />
                    댓글 <span className="ml-2 text-teal-400">{comments.length}</span>
                </h2>

                {/* 댓글 작성창 */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700/50 shadow-lg">
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            className="w-full bg-gray-900/50 text-gray-200 p-4 rounded-xl border border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all resize-none min-h-[100px]"
                            placeholder={currentUserId ? "공연에 대한 생각을 공유해주세요!" : "로그인이 필요한 서비스입니다."}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            disabled={!currentUserId || isSubmitting}
                        />
                        <div className="flex justify-end mt-3">
                            <button type="submit" disabled={!commentContent.trim() || isSubmitting || !currentUserId} className="bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700 text-white font-bold py-2 px-6 rounded-xl flex items-center transition-all">
                                <Send size={16} className="mr-2" />{isSubmitting ? "등록 중..." : "등록"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 댓글 목록 */}
                <div className="space-y-4">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-[#1e293b]/50 p-6 rounded-2xl border border-gray-700/30 group hover:border-gray-600 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 mr-3 border border-teal-500/30"><User size={20} /></div>
                                        <div>
                                            <div className="text-gray-200 font-bold text-sm">{comment.nickname} ({maskId(comment.userLoginId)})</div>
                                            <div className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</div>
                                        </div>
                                    </div>
                                    
                                    {/* 본인 댓글일 때만 수정/삭제 노출 */}
                                    {currentUserId && Number(currentUserId) === Number(comment.userId) && (
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                            {editingCommentId !== comment.id && (
                                                <>
                                                    <button onClick={() => handleEditStart(comment)} className="text-gray-500 hover:text-teal-400"><Edit size={16} /></button>
                                                    <button onClick={() => handleCommentDelete(comment.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={16} /></button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* ✨ 수정 모드와 보기 모드 분기 */}
                                {editingCommentId === comment.id ? (
                                    <div className="mt-2">
                                        <textarea
                                            className="w-full bg-gray-900 text-gray-200 p-3 rounded-xl border border-teal-500 outline-none resize-none focus:ring-1 focus:ring-teal-500"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            rows="3"
                                        />
                                        <div className="flex justify-end space-x-3 mt-3">
                                            <button onClick={handleEditCancel} className="flex items-center text-gray-400 hover:text-gray-200 text-sm py-1 px-3 rounded-lg transition-colors"><X size={14} className="mr-1"/> 취소</button>
                                            <button onClick={() => handleEditSubmit(comment.id)} className="flex items-center bg-teal-600 hover:bg-teal-500 text-white text-sm py-1.5 px-4 rounded-lg font-bold transition-all"><Check size={14} className="mr-1"/> 수정완료</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-300 leading-relaxed pl-1">
                                        {comment.content}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-[#1e293b]/30 rounded-2xl border border-dashed border-gray-700 text-gray-500">아직 작성된 댓글이 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewDetail;