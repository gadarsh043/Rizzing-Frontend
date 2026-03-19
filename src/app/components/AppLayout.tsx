import React from "react";
import { Outlet, useLocation } from "react-router";
import { BottomNav } from "./BottomNav";

export const AppLayout: React.FC = () => {
  const location = useLocation();

  // Both the chat list and individual chat need full-height layout
  const isFullHeight =
    location.pathname === "/app/chat" ||
    location.pathname.startsWith("/app/chat/");

  return (
    <div
      className="relative min-h-screen flex items-start justify-center"
      style={{ background: "#050510" }}
    >
      {/* Desktop ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% -20%, rgba(139,92,246,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Mobile container */}
      <div
        className="relative w-full max-w-[430px] flex flex-col overflow-hidden"
        style={{ background: "#050510", minHeight: "100svh", height: "100svh" }}
      >
        {isFullHeight ? (
          /* Chat screens fill full height with bottom nav overlaid */
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        ) : (
          /* Other screens scroll normally with bottom nav space */
          <div className="flex-1 overflow-y-auto pb-28">
            <Outlet />
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
};
