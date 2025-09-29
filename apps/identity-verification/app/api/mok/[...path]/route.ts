export const runtime = "nodejs"; // ✅ Node 런타임
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as DREAM_SECURITY from "./dream-security.service";

export async function POST(request: NextRequest, { params }: { params: { path?: string[] } }) {
  const { searchParams } = new URL(request.url);
  const wv = searchParams.get("wv");
  const { path = [] } = params;
  console.log(wv, "wv");

  if (path.length === 0) {
    return NextResponse.json({ message: "[POST] Base /api/mok endpoint" });
  }

  const nextUrl = path.join("/");

  try {
    let result = null;

    switch (nextUrl) {
      case "mok_std_request":
        // eslint-disable-next-line no-case-declarations
        const { serviceId, encClientTxId } = DREAM_SECURITY.clientTxId();
        // eslint-disable-next-line no-case-declarations
        const returnUrl = `${process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL as string}api/mok/mok_std_result?wv=${wv}`;

        result = {
          /* 본인확인 서비스 용도 */
          /* 01001 : 회원가입, 01002 : 정보변경, 01003 : ID찾기, 01004 : 비밀번호찾기, 01005 : 본인확인용, 01006 : 성인인증, 01007 : 상품구매/결제, 01999 : 기타 */
          usageCode: "01006",
          /* 본인확인 서비스 ID */
          serviceId,
          /* 암호화된 본인확인 거래 요청 정보 */
          encryptReqClientInfo: encClientTxId,
          /* 이용상품 코드 */
          /* 이용상품 코드, telcoAuth : 휴대폰본인확인 (SMS인증시 인증번호 발송 방식 "SMS")*/
          /* 이용상품 코드, telcoAuth-LMS : 휴대폰본인확인 (SMS인증시 인증번호 발송 방식 "LMS")*/
          serviceType: "telcoAuth",
          /* 본인확인 결과 타입 */
          /* 본인확인 결과 타입, "MOKToken"  : 개인정보 응답결과를 이용기관 서버에서 본인확인 서버에 요청하여 수신 후 처리 */
          retTransferType: "MOKToken",
          /* 본인확인 결과 수신 URL */
          returnUrl,
        };
        console.log(result, "result");
        return NextResponse.json(result);
      case "mok_std_result":
        // TODO: 본인확인 서비스 결과 처리 - 본인인증 결과로 받은 토큰 처리
        // * 여기서 받은 값을 서버로 전송 - 회원가입, 본인확인갱신 등
        // eslint-disable-next-line no-case-declarations
        const text = await request.text();
        console.log(text, "text");
        // eslint-disable-next-line no-case-declarations
        const params = new URLSearchParams(text);
        console.log(params, "params");
        // eslint-disable-next-line no-case-declarations
        const data = params.get("data");
        console.log(data, "data");

        console.log(wv, "wv");
        result = JSON.parse(decodeURIComponent(data ?? "{}"));
        console.log(result, "result");

        try {
          const reqData = {
            comType: "dreamsecurity",
            data: result.encryptMOKKeyToken,
            wv,
          };
          console.log(reqData, "reqData");
          return await redirect(reqData);
        } catch (e) {
          console.log(e, "E");
          return NextResponse.json({
            error: `Validation error\n${JSON.stringify(e)}`,
          });
        }
      default:
        throw new Error("invalidAction");
    }
  } catch (error: any) {
    console.log(error, "error");
    console.error(error);
    return NextResponse.json(error);
  }
}

// 안전한 redirect 함수 (문자열 이어붙이기 금지)
function redirect(formData: Record<string, unknown>) {
  // 쿼리스트링 구성
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(formData)) {
    if (v !== null && v !== undefined && v !== "") {
      sp.set(k, String(v));
    }
  }

  const base = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL; // 예: "http://localhost:3300/"

  if (base && /^https?:\/\//i.test(base)) {
    // 절대 URL로 안전하게 생성
    const target = new URL("/identity-verification/success", base);
    target.search = sp.toString();
    return NextResponse.redirect(target, { status: 302 });
  }

  // 환경변수가 없거나 형식이 이상하면 상대 경로로 처리
  const relative = `/identity-verification/success?${sp.toString()}`;
  return NextResponse.redirect(relative, { status: 302 });
}

// LEGACY
// export async function POST(request: NextRequest, { params }: { params: { path?: string[] } }) {
//   const { path = [] } = params;
//
//   if (path.length === 0) {
//     return NextResponse.json({ message: "[POST] Base /api/mok endpoint" });
//   }
//   console.log(params, "params");
//   const nextUrl = path.join("/");
//
//   try {
//     let result = null;
//
//     switch (nextUrl) {
//       case "mok_std_request":
//         // eslint-disable-next-line no-case-declarations
//         const { serviceId, encClientTxId } = DREAM_SECURITY.clientTxId();
//         // eslint-disable-next-line no-case-declarations
//         const returnUrl = `${process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL as string}api/mok/mok_std_result`;
//
//         result = {
//           /* 본인확인 서비스 용도 */
//           /* 01001 : 회원가입, 01002 : 정보변경, 01003 : ID찾기, 01004 : 비밀번호찾기, 01005 : 본인확인용, 01006 : 성인인증, 01007 : 상품구매/결제, 01999 : 기타 */
//           usageCode: "01006",
//           /* 본인확인 서비스 ID */
//           serviceId,
//           /* 암호화된 본인확인 거래 요청 정보 */
//           encryptReqClientInfo: encClientTxId,
//           /* 이용상품 코드 */
//           /* 이용상품 코드, telcoAuth : 휴대폰본인확인 (SMS인증시 인증번호 발송 방식 "SMS")*/
//           /* 이용상품 코드, telcoAuth-LMS : 휴대폰본인확인 (SMS인증시 인증번호 발송 방식 "LMS")*/
//           serviceType: "telcoAuth",
//           /* 본인확인 결과 타입 */
//           /* 본인확인 결과 타입, "MOKToken"  : 개인정보 응답결과를 이용기관 서버에서 본인확인 서버에 요청하여 수신 후 처리 */
//           retTransferType: "MOKToken",
//           /* 본인확인 결과 수신 URL */
//           returnUrl,
//         };
//         console.log(result, "result");
//         return NextResponse.json(result);
//       case "mok_std_result":
//         // TODO: 본인확인 서비스 결과 처리 - 본인인증 결과로 받은 토큰 처리
//         // * 여기서 받은 값을 서버로 전송 - 회원가입, 본인확인갱신 등
//         // eslint-disable-next-line no-case-declarations
//         const text = await request.text();
//         console.log(text, "text");
//         // eslint-disable-next-line no-case-declarations
//         const params = new URLSearchParams(text);
//         console.log(params, "params");
//         // eslint-disable-next-line no-case-declarations
//         const data = params.get("data");
//         console.log(data, "data");
//         result = JSON.parse(decodeURIComponent(data ?? "{}"));
//
//         try {
//           const reqData = {
//             auth: JSON.stringify({
//               comType: "dreamsecurity",
//               data: result.encryptMOKKeyToken,
//             }),
//           };
//           return NextResponse.json(reqData);
//         } catch (e) {
//           return NextResponse.json({
//             error: `Validation error\n${JSON.stringify(e)}`,
//           });
//         }
//       default:
//         throw new Error("invalidAction");
//     }
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json(error);
//   }
// }
