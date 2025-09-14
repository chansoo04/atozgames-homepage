/* eslint-disable no-console */
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type windowWithUnity = Window &
  typeof globalThis & {
    webkit?: {
      messageHandlers?: {
        unityControl?: {
          postMessage: (message: string) => void;
        };
      };
    };
    Unity?: {
      call: (message: string) => void;
      sendMessage: (objectName: string, methodName: string, message: string) => void;
    };
  };

export default function RouteChangeListener() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousPathRef.current !== null && previousPathRef.current !== pathname) {
      const payload = JSON.stringify({ type: "routeChange", route: pathname });

      try {
        const _window: windowWithUnity = window;
        // iOS GPM WebView
        if (_window?.webkit?.messageHandlers?.unityControl) {
          _window.webkit.messageHandlers.unityControl.postMessage(payload);
        }
        // Android GPM WebView
        else if (_window?.Unity?.call) {
          _window.Unity.call(payload);
        } else if (_window?.Unity?.sendMessage) {
          _window.Unity.sendMessage("UnityControl", "OnMessage", payload);
        }
        // Fallback for other environments
        else {
          // try {
          //   location.href = `atoz-signin://routeChange?route=${encodeURIComponent(pathname)}`;
          // } catch (err) {
          //   console.warn(
          //     '[WebView] Failed to send route change via URL scheme:',
          //     err,
          //   );
          // }

          window.parent.postMessage(payload, "*");
          console.warn("[WebView] No Unity message handler found");
        }
      } catch (err) {
        console.error("[WebView] Error sending message to Unity:", err);
      }
      console.log("[WebView] Route changed:", pathname);
    }

    previousPathRef.current = pathname;
  }, [pathname]);

  return null;
}
