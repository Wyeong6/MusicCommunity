/** @type {import('tailwindcss').Config} */
// ES Module (export default) 대신 CommonJS (module.exports) 방식으로 변경하여
// PostCSS 및 Vite와의 호환성을 확보합니다.
module.exports = {
    // Tailwind가 스타일을 생성하기 위해 스캔할 파일 경로 목록입니다.
    content: [
      "./index.html", // 루트의 index.html 스캔
      "./src/**/*.{js,ts,jsx,tsx}", // src 폴더 하위의 모든 React 컴포넌트 포함
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  