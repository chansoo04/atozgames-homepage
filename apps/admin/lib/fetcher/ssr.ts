import ky, { BeforeErrorHook, HTTPError } from "ky";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const getErrorMessage: BeforeErrorHook = async (error: HTTPError) => {
  if (error.response.status === 401) {
    return notFound();
  }
  return error;
};

const ssr = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  timeout: 60000,
  next: { revalidate: 0 },
  hooks: {
    beforeRequest: [
      async (request) => {
        const cookiesArray = cookies().getAll();
        request.headers.set(
          "Cookie",
          cookiesArray.reduce((acc, item) => acc + `${item.name}=${item.value}; `, ""),
        );
        request.headers.set(
          "Authorization",
          `Bearer ${cookiesArray.find((item) => item.name === "b2bv2-merchant")?.value}`,
        );
        return request;
      },
    ],
    beforeError: [getErrorMessage],
  },
});

export default ssr;

// import ky from "ky";
// import { cookies } from "next/headers";
//
// // TODO : SSR에서도 revalidate 관련 값을 받아와야 함. 현재는 0으로 처리
// const ssr = ky.create({
//   prefixUrl: process.env.NEXT_PUBLIC_API_URL,
//   credentials: "include",
//   timeout: 10000,
//   next: { revalidate: 0 },
//   hooks: {
//     beforeRequest: [
//       async (request) => {
//         const cookiesArray = cookies().getAll();
//         request.headers.set(
//           "Cookie",
//           cookiesArray.reduce((acc, item) => acc + `${item.name}=${item.value}; `, ""),
//         );
//         request.headers.set(
//           "Authorization",
//           `Bearer ${cookiesArray.find((item) => item.name === "adminAccessToken")?.value}`,
//         );
//         return request;
//       },
//     ],
//   },
// });
//
// export default ssr;
