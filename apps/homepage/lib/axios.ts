import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SELF_URL, // 환경변수에 정의한 API 기본 URL :contentReference[oaicite:0]{index=0}
  headers: {
    "Content-Type": "application/json", // JSON 요청을 기본으로 설정 :contentReference[oaicite:1]{index=1}
  },
  timeout: 10000, // 요청 타임아웃(ms)
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // 1) 서버에 토큰 유효성 검증 요청
    const req = await axios.get("/api/auth/validate"); // 예: /api/auth/validate 엔드포인트 :contentReference[oaicite:2]{index=2}

    if (req.data.result === "failure") {
      window.location.href = "/login";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
