import React from 'react';

/**
 * 일반적인 모달 팝업의 배경 및 컨테이너 역할을 하는 컴포넌트입니다.
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 함수
 * @param {React.ReactNode} children - 모달 내부에 표시할 내용 (Seats 컴포넌트가 들어갈 예정)
 */
function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    // 모달 배경을 클릭했을 때 닫히도록 하는 함수
    const handleBackdropClick = (e) => {
        // 배경을 직접 클릭했을 때만 닫히도록 내부 컨텐츠 클릭은 무시
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        // 전체 화면을 덮는 배경 (backdrop)
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={handleBackdropClick}
        >
            {/* 모달 내용 컨테이너 (스크롤 가능하도록 max-h-full 설정) */}
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-full overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
                
                {/* 닫기 버튼 */}
                <div className="flex justify-end p-4 sticky top-0 bg-gray-800 z-10">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-3xl font-light leading-none transition duration-200"
                        aria-label="Close modal"
                    >
                        &times; 
                    </button>
                </div>
                
                {/* 실제 컨텐츠 */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
