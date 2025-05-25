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
