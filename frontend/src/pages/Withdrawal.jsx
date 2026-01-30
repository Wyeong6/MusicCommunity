import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx'; // 💡 경로 수정
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/users';


const Withdrawal = () => {
    
    const { userId, logout } = useAuth(); 

    const handleWithdrawal = async () => {
        if (!window.confirm(`정말로 사용자 ${userId}로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }
    
        try {
            const res = await axios.delete(`${API_BASE_URL}/withdrawal`, {
                withCredentials: true,
            });
    
            console.log("탈퇴 성공:", res.status);
    
            alert("회원 탈퇴가 완료되었습니다.");
            
            // 쿠키 삭제 + 상태 초기화
            logout();
    
            // 메인 화면으로 이동
            window.location.href = "/";
    
        } catch (error) {
            console.error("탈퇴 실패:", error);
            alert("탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-red-200 pb-2 flex items-center">
                <LogOut className="w-6 h-6 mr-2 text-red-600" /> 회원 탈퇴
            </h2>
            <div className="p-8 bg-red-50 border-2 border-red-300 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                    <ShieldAlert className="w-10 h-10 mr-4 text-red-500" />
                    <h3 className="text-2xl font-semibold text-red-700">잠깐, 탈퇴하시겠어요?</h3>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                    회원 탈퇴를 진행하시면 고객님의 모든 예약 정보와 개인 정보가 영구적으로 삭제되며, 복구할 수 없습니다. 현재 로그인된 사용자 고유번호는 <span className="font-bold text-red-800">{userId}</span>입니다.
                </p>
                
                {/* 탈퇴 버튼 */}
                <button 
                    onClick={handleWithdrawal} 
                    className="w-full p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-md transform hover:scale-[1.01]"
                >
                    확인 및 회원 탈퇴
                </button>
                <p className="text-xs text-red-500 mt-3 text-center">
                    **탈퇴 후 7일간은 재가입이 제한될 수 있습니다.**
                </p>
            </div>
        </div>
    );
};

export default Withdrawal;