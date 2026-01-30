import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import * as PortOne from "@portone/browser-sdk/v2";

const BASE_API_URL = 'http://localhost:8080/api';
const PORTONE_CHANNEL_KEY = 'channel-key-b9a02b61-ac5f-4ac9-83b3-37a35ed9149b';
const STORE_ID = 'store-74d59c31-6c1a-46ca-ae7c-6b5ffadeff12';
const TICKET_PRICE = 1000;

const api = axios.create({
    baseURL: BASE_API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const Modal = ({ isOpen, title, message, onClose, isError = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className={`bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border-t-4 ${isError ? 'border-red-500' : 'border-indigo-500'}`}>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-300 mb-6 whitespace-pre-wrap">{message}</p>
                <button
                    onClick={onClose}
                    className={`w-full font-semibold py-2 rounded-lg transition duration-150 ${isError ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                >
                    확인
                </button>
            </div>
        </div>
    );
};

function Seats() {
    const { eventId } = useParams();

    // --- 상태 훅들: 항상 컴포넌트 최상단에 모아두기 ---
    const [isLoading, setIsLoading] = useState(true);
    const [seats, setSeats] = useState([]);
    const [selectedSeatId, setSelectedSeatId] = useState(null);
    const [isReserving, setIsReserving] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', isError: false });
    const [shouldCloseWindow, setShouldCloseWindow] = useState(false);

    // 라우트 유효성
    if (!eventId || eventId === 'undefined') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <p className="text-2xl text-red-500 mb-4">⚠️ 오류: 이벤트 ID를 찾을 수 없습니다.</p>
                <p className="text-gray-400">올바른 경로로 접근했는지 확인해 주세요. (예: /events/101)</p>
            </div>
        );
    }

    // -----------------------
    // closeModal: 창 닫기 시도 (여러 방법으로 시도)
    // -----------------------
    const closeModal = useCallback(() => {
        const shouldClose = shouldCloseWindow;
        setModal({ isOpen: false, title: '', message: '', isError: false });
        setShouldCloseWindow(false);
    
        if (shouldClose) {
            window.open('', '_self');
            window.close();
        }
    }, [shouldCloseWindow]);
    
    // -----------------------
    // checkLogin: 컴포넌트 마운트 시 (쿠키 없는 경우 모달 띄워서 창 닫도록 플래그 설정)
    // -----------------------
    useEffect(() => {
        let mounted = true;
        const checkLogin = async () => {
            try {
                const res = await api.get("/users/me");
                if (!res.data?.userId) {
                    throw new Error("no user");
                }
            } catch (err) {
                if (!mounted) return;
                // 세션 만료: 모달 띄우고 창 닫기 플래그 설정
                setModal({
                    isOpen: true,
                    title: "세션 만료",
                    message: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
                    isError: false,
                });
                setShouldCloseWindow(true);
            }
        };
        checkLogin();
        return () => { mounted = false; };
    }, []);

    // -----------------------
    // fetchSeats: 좌석 불러오기 (폴링 포함)
    // -----------------------
    const SEATS_PATH = `/events/${eventId}/seats`;
    const RESERVE_PATH = `/reservations`;
    const PAYMENT_PATH = `/payment/complete`;

    const fetchSeats = useCallback(async () => {
        if (!eventId || eventId === 'undefined') return;
        try {
            const response = await api.get(SEATS_PATH);
            const data = response.data || [];
            const formattedSeats = data.map(seat => ({
                id: seat.id,
                number: seat.seatCode,
                isReserved: seat.isReserved,
                eventId: seat.eventId,
            }));
            formattedSeats.sort((a, b) => a.number.localeCompare(b.number));
            setSeats(formattedSeats);
        } catch (error) {
            console.error("좌석 데이터 로드 오류:", error);
            const status = error.response ? error.response.status : null;
            let errorMessage = status ? `API 호출 실패: 상태 코드 ${status}` : `네트워크 오류 또는 서버 연결 실패: ${error.message}`;
            if (status === 401) errorMessage = '로그인 세션이 만료되었거나 권한이 없습니다.';
            setModal({ isOpen: true, title: '데이터 로드 실패', message: errorMessage, isError: true });
        } finally {
            setIsLoading(false);
        }
    }, [SEATS_PATH, eventId]);

    useEffect(() => {
        fetchSeats();
        const intervalId = setInterval(fetchSeats, 10000);
        return () => clearInterval(intervalId);
    }, [fetchSeats]);

    // 좌석 클릭
    const handleSeatClick = useCallback((seatId, isReserved) => {
        if (isReserved) {
            setModal({ isOpen: true, title: '예매 불가', message: '이미 예약된 좌석입니다.', isError: true });
            return;
        }
        setSelectedSeatId(prev => (prev === seatId ? null : seatId));
    }, []);

    // --- 결제/예약 관련 함수들 (기존 로직 유지) ---
    const finalizeReservation = async (paymentResult, TICKET_PRICE) => {
        try {
            const payload = {
                eventId: Number(eventId),
                seatId: selectedSeatId,
                paymentId: paymentResult.paymentId,
                amount: TICKET_PRICE,
            };
            const verifyResponse = await api.post(PAYMENT_PATH, payload);
            if (verifyResponse.status !== 200) throw new Error("결제 검증 실패(위변조 가능성)");
            const response = await api.post(RESERVE_PATH, payload);
            if (response.status === 201) {
                const successMessage = response.data.message || `좌석 ${selectedSeatId} 예매가 성공적으로 완료되었습니다.\n[결제 ID: ${paymentResult.paymentId}]`;
                setModal({ isOpen: true, title: '결제 및 예매 성공!', message: successMessage, isError: false });
                setSelectedSeatId(null);
                setShouldCloseWindow(true);
                await fetchSeats();
            }
        } catch (error) {
            console.error("최종 예약 확정 API 오류:", error);
            const status = error.response ? error.response.status : null;
            const result = error.response ? error.response.data : {};
            let title = '최종 예약 실패';
            let errorMessage = result.message || `예약 확정 중 서버 오류가 발생했습니다. (${status})`;
            if (status === 409) {
                title = '예매 충돌 (결제는 성공)';
                errorMessage = result.message || `결제는 성공했으나 동시성 문제로 좌석 예약 실패. (결제 ID: ${paymentResult.paymentId})`;
            }
            setModal({ isOpen: true, title, message: errorMessage, isError: true });
        } finally {
            setIsReserving(false);
        }
    };

    const handleReserve = async () => {
        if (!selectedSeatId || isReserving) return;
        setIsReserving(true);
        const selectedSeat = seats.find(s => s.id === selectedSeatId);
        const seatNumber = selectedSeat ? selectedSeat.number : '선택된 좌석';
        const orderName = `이벤트 ${eventId} - 좌석 ${seatNumber} 예약`;
        const paymentId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

        try {
            const response = await PortOne.requestPayment({
                channelKey: PORTONE_CHANNEL_KEY,
                storeId: STORE_ID,
                paymentId,
                orderId: `order_${Date.now()}_${eventId}_${selectedSeatId}`,
                totalAmount: TICKET_PRICE,
                orderName,
                product: { name: orderName, amount: TICKET_PRICE },
                customer: { fullName: '예매 고객', phoneNumber: "01052591381", email: 'buyer.test@example.com' },
                payMethod: "CARD",
                currency: "CURRENCY_KRW",
            });
            if (response.code) {
                setModal({ isOpen: true, title: '결제를 취소하였습니다', message: '', isError: false });
                setIsReserving(false);
                return;
            }
            if (response.paymentId) {
                await finalizeReservation(response, TICKET_PRICE);
            } else {
                let title = '결제 실패';
                let message = `결제에 실패했습니다. (코드: ${response.code})\n` + (response.message || '다시 시도해 주세요.');
                if (response.code === 'V2_PAYMENT_FAILED_CANCELED') {
                    title = '결제 취소';
                    message = '고객에 의해 결제가 취소되었습니다.';
                }
                setModal({ isOpen: true, title, message, isError: true });
                setIsReserving(false);
            }
        } catch (error) {
            console.error("PortOne 결제 요청 중 오류 발생:", error);
            setModal({ isOpen: true, title: '결제 시스템 오류', message: `결제 요청 중 알 수 없는 오류가 발생했습니다.\n상세: ${error.message}`, isError: true });
            setIsReserving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="w-16 h-16 border-4 border-t-4 border-t-cyan-500 border-gray-700 rounded-full animate-spin mb-6" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="text-xl font-medium mb-2 text-cyan-400">이벤트 {eventId} 좌석 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 text-center bg-gray-900 min-h-screen">
            <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} onClose={closeModal} isError={modal.isError} />

            <h2 className="text-3xl font-bold text-white mb-6">이벤트 {eventId} 좌석 선택 ({TICKET_PRICE.toLocaleString()}원)</h2>

            <div className="flex justify-center items-center gap-4 mb-8 p-3 bg-gray-800 rounded-lg max-w-lg mx-auto shadow-md">
                <p className="text-lg text-gray-400">선택된 좌석 ID:</p>
                <span className={`font-black text-xl transition-colors ${selectedSeatId ? 'text-yellow-400' : 'text-red-400'}`}>{selectedSeatId || '없음'}</span>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="w-full bg-indigo-700 text-white py-3 mb-8 rounded-t-lg shadow-xl text-lg font-bold tracking-widest">STATION / SCREEN</div>

                {seats.length === 0 ? (
                    <p className="text-white text-xl p-8 bg-gray-800 rounded-xl">이 이벤트에 등록된 좌석 정보가 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-6 bg-gray-800 rounded-xl shadow-lg mx-auto">
                        {seats.map(seat => (
                            <div
                                key={seat.id}
                                className={`h-10 flex items-center justify-center rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-md
                                    ${seat.isReserved ? 'bg-red-700 text-white cursor-not-allowed opacity-70' : seat.id === selectedSeatId ? 'bg-yellow-400 text-gray-900 ring-4 ring-yellow-300 scale-105 shadow-2xl' : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer hover:shadow-lg hover:scale-[1.02]'}
                                `}
                                onClick={() => handleSeatClick(seat.id, seat.isReserved)}
                            >
                                {seat.number}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className='mt-10'>
                <button onClick={handleReserve} disabled={!selectedSeatId || isReserving} className="py-3 px-8 text-xl font-bold rounded-lg shadow-xl transition duration-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-105">
                    {isReserving ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            결제 요청 중...
                        </div>
                    ) : selectedSeatId ? `${selectedSeatId}번 좌석 결제 후 예매 확정 (${TICKET_PRICE.toLocaleString()}원)` : '좌석을 선택하세요'}
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">좌석 상태는 10초마다 자동으로 업데이트됩니다 (API 폴링).</p>
        </div>
    );
}

export default Seats;
