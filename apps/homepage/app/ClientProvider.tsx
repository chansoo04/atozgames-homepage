"use client"; // "use client" 를 작성해줘야 하기 때문에 이 파일이 필요함
import { arrayIncludes } from "@toss/utils";
import csr from "lib/fetcher/csr";
import { Toaster } from "react-hot-toast";
import type { PropsWithChildren } from "react";
import { OverlayProvider } from "@toss/use-overlay";
import { SWRConfig } from "swr";
import { HTTPError } from "ky";

export default function ClientProviders({ children }: PropsWithChildren) {
  return (
    <OverlayProvider>
      <Toaster position="bottom-right" />
      <SWRConfig
        value={{
          onErrorRetry: (error: HTTPError, key, config, revalidate, { retryCount }) => {
            if (arrayIncludes([401, 404], error.response?.status)) return; // Never retry on specific HTTP status codes.
            setTimeout(() => revalidate({ retryCount }), 1000); // Retry after 1 seconds.
          },
          fetcher: (url) => csr.get(url).json(),
        }}
      >
        {children}
      </SWRConfig>
    </OverlayProvider>
  );
}
