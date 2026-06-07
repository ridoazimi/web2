"use client";

import { useEffect } from "react";

export default function SalesTracker() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const salesCode = params.get("sl");

        if (salesCode) {
          // Set 3 days expiration
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 3);

          // Save to localStorage
          localStorage.setItem("sales_code", salesCode);
          localStorage.setItem("sales_code_expires", expirationDate.toISOString());

          // Save to document cookie (accessible on request headers)
          document.cookie = `sales_code=${encodeURIComponent(
            salesCode
          )}; max-age=${3 * 24 * 60 * 60}; path=/; SameSite=Lax`;

          // Clean up the ?sl= query param from URL bar
          params.delete("sl");
          const newSearch = params.toString();
          const newPath =
            window.location.pathname + (newSearch ? `?${newSearch}` : "");
          
          window.history.replaceState({}, "", newPath);
        } else {
          // Check if existing tracking has expired
          const expiresStr = localStorage.getItem("sales_code_expires");
          if (expiresStr) {
            const expires = new Date(expiresStr);
            if (new Date() > expires) {
              // Expire tracking
              localStorage.removeItem("sales_code");
              localStorage.removeItem("sales_code_expires");
              // Clear cookie
              document.cookie = "sales_code=; max-age=0; path=/;";
            }
          }
        }
      } catch (err) {
        console.error("Sales tracking failed to initialize:", err);
      }
    }
  }, []);

  return null;
}
