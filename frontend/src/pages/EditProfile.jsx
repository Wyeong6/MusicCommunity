import React, { useState } from 'react';
import { UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const EditProfile = () => {
    const { userId, userName, login, userRole } = useAuth(); // login 함수를 가져와 상태 동기화에 사용
    
    const [nickname, setNickname] = useState(userName || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. 유효성 검사: 새 비밀번호 입력 시 확인 비밀번호와 일치하는지
        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
            return;
        }

        try {
            const response = await axios.put(`http://localhost:8080/api/users/update`, {
                id: userId,          // 고유 번호
                nickname: nickname,  // 변경할 닉네임
                currentPassword: currentPassword, // 현재 비밀번호 (검증용)
                newPassword: newPassword          // 새 비밀번호 (선택사항)
            }, { withCredentials: true });

            if (response.status === 200) {
                setMessage({ type: 'success', text: '정보가 성공적으로 수정되었습니다.' });
                // 💡 중요: 전역 AuthContext의 닉네임 상태도 업데이트해줍니다.
                login(userRole, userId, nickname); 
                
                // 비밀번호 필드 초기화
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            const errorMsg = error.response?.data || '수정에 실패했습니다.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-teal-200 pb-2 flex items-center">
                <UserCog className="w-6 h-6 mr-2 text-teal-600" /> 개인 정보 수정
            </h2>
            <div className="p-10 bg-white border-2 border-teal-100 rounded-xl shadow-inner max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 닉네임 수정 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                        <input 
                            type="text" 
                            value={nickname} 
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500" 
                            required
                        />
                    </div>

                    <hr className="my-6" />

                    {/* 비밀번호 변경 섹션 */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <p className="text-sm text-gray-500 font-semibold italic">비밀번호를 변경하려면 아래를 입력하세요.</p>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
                            <input 
                                type="password" 
                                placeholder="현재 비밀번호를 입력해야 정보를 수정할 수 있습니다."
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 (선택)</label>
                            <input 
                                type="password" 
                                placeholder="변경할 경우에만 입력하세요."
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
                            <input 
                                type="password" 
                                placeholder="한 번 더 입력하세요."
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg" 
                            />
                        </div>
                    </div>

                    {message.text && (
                        <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.text}
                        </p>
                    )}

                    <button type="submit" className="w-full p-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition shadow-md">
                        정보 수정 저장
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;