"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefreshHandler({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    // Refresh page every 9 detik to check if webhook has processed the order
    const interval = setInterval(() => {
      router.refresh();
    }, 9000);

    return () => clearInterval(interval);
  }, [router, orderId]);

  return null;
}
