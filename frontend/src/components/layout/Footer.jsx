import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 p-6 mt-auto shadow-inner w-full">
      <div className="container mx-auto text-center">
        
        {/* 연락처 및 회사 정보 */}
        <div className="mb-4 text-sm">
          <p>MUSIC COMMUNITY | 대표: 김개발</p>
          <p>고객센터: 1588-XXXX | 이메일: contact@musiccommunity.com</p>
          <p>서울특별시 강남구 테일윈드로 123</p>
        </div>
        
        {/* 저작권 표시 */}
        <p className="text-xs border-t border-gray-700 pt-4">
          &copy; {new Date().getFullYear()} MUSIC COMMUNITY. All rights reserved.
        </p>
        
      </div>
    </footer>
  );
};

export default Footer;
