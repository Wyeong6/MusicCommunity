import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], 
  
  // 💡 [Tailwind V3 환경에 맞게 정리]
  // PostCSS 설정(autoprefixer, tailwindcss)은 postcss.config.js 파일에 위임합니다.
  // 이전에 캐시 에러를 유발했던 import와 css 객체 설정을 제거했습니다.
  
  // ✅ [추가] 꼬여있는 캐시 폴더 문제를 우회하기 위해 새로운 디렉토리를 지정합니다.
  cacheDir: './.temp_vite', 

  // ✅ [선택사항] 백엔드 API 프록시 설정 (필요하면 남겨두세요)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
