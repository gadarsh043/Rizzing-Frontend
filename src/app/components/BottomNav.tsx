import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Home, MessageCircle, User } from "lucide-react";
import { useApp } from "../context/AppContext";

const tabs = [
  { icon: Home,          label: "Home",    path: "/app/home" },
  { icon: MessageCircle, label: "Chats",   path: "/app/chat" },
  { icon: User,          label: "Profile", path: "/app/profile" },
];

export const BottomNav: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { conversations } = useApp();
  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <nav
      className="bottom-nav-glass fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-6 pt-3 pb-5">
        {tabs.map((tab) => {
          const isActive   = location.pathname === tab.path
                          || location.pathname.startsWith(tab.path + "/");
          const Icon       = tab.icon;
          const isChatTab  = tab.path === "/app/chat";

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-1.5 transition-all duration-200 active:scale-90"
              style={{ minWidth: 72 }}
            >
              {/* Icon pill */}
              <div
                className="relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300"
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(219,39,119,0.25) 100%)",
                        boxShadow:
                          "0 0 20px rgba(139,92,246,0.45), 0 0 40px rgba(236,72,153,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                        border: "1px solid rgba(167,139,250,0.3)",
                      }
                    : {
                        background: "transparent",
                        border: "1px solid transparent",
                      }
                }
              >
                {/* SVG gradient definition (only when active) */}
                {isActive && (
                  <svg width={0} height={0} style={{ position: "absolute" }}>
                    <defs>
                      <linearGradient id={`ng-${tab.label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#f472b6" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}

                <Icon
                  size={21}
                  style={
                    isActive
                      ? {
                          stroke: `url(#ng-${tab.label})`,
                          filter: "drop-shadow(0 0 6px rgba(139,92,246,0.9))",
                        }
                      : { color: "rgba(255,255,255,0.28)" }
                  }
                />

                {/* Unread badge on Chats */}
                {isChatTab && totalUnread > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] px-1"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #db2777)",
                      color: "white",
                      fontWeight: 800,
                      boxShadow: "0 2px 8px rgba(124,58,237,0.6)",
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="text-[11px] transition-all duration-300"
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontWeight: 700,
                      }
                    : { color: "rgba(255,255,255,0.28)", fontWeight: 400 }
                }
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
