import React from 'react';
import { User, Mail, Shield } from 'lucide-react';

// 사용자 프로필 정보를 표시하는 컴포넌트입니다.
const ProfileView = ({ userProfile }) => {
    if (!userProfile) {
        return (
            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg shadow-inner">
                사용자 프로필 정보를 불러올 수 없습니다.
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 border border-indigo-100">
            <h2 className="text-2xl font-bold text-indigo-600 border-b pb-2 mb-4">내 프로필 정보</h2>
            
            <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-md">
                <User className="w-6 h-6 text-indigo-500" />
                <p className="text-lg font-semibold text-gray-700 w-24">사용자 ID:</p>
                <span className="text-lg text-gray-900 font-mono">{userProfile.id}</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 border-b">
                <Mail className="w-5 h-5 text-gray-500" />
                <p className="text-lg font-semibold text-gray-700 w-24">이메일:</p>
                <span className="text-lg text-gray-900">{userProfile.email}</span>
            </div>

            <div className="flex items-center space-x-4 p-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <p className="text-lg font-semibold text-gray-700 w-24">권한:</p>
                <span className={`text-lg font-bold ${userProfile.role === 'ADMIN' ? 'text-red-600' : 'text-green-600'}`}>
                    {userProfile.role}
                </span>
            </div>

            <button className="mt-6 w-full py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition duration-200">
                개인 정보 수정하기 (미구현)
            </button>
        </div>
    );
};

export default ProfileView;