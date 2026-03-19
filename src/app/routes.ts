import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { LoginScreen } from "./components/screens/LoginScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { ResultScreen } from "./components/screens/ResultScreen";
import { ChatListScreen } from "./components/screens/ChatListScreen";
import { ChatScreen } from "./components/screens/ChatScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginScreen,
  },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      { path: "home", Component: HomeScreen },
      { path: "result", Component: ResultScreen },
      { path: "chat", Component: ChatListScreen },
      { path: "chat/:id", Component: ChatScreen },
      { path: "profile", Component: ProfileScreen },
    ],
  },
]);
