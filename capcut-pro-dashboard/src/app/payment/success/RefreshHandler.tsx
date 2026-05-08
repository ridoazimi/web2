"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefreshHandler({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    // Refresh page every 3 seconds to check if webhook has processed the order
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [router, orderId]);

  return null;
}
