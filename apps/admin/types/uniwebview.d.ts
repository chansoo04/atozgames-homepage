// 반드시 모듈로 인식되도록 export 구문 추가
export {};

declare global {
  interface Window {
    uniWebView: {
      sendMessage: (msg: string) => void;
      // OnFirebaseIdMsg: (fbId: any) => string;
    };
    OnFirebaseIdMsg: (fbId: any) => string;
  }
}
