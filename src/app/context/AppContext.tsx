import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  time: string;
  isGenerated?: boolean;
}

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  file?: File;
}

export interface ConversationPerson {
  name: string;
  age: number;
  photo: string;
  bio: string;
  interests: string[];
  isOnline: boolean;
  lastSeen: string;
  matchPercent: number;
}

export interface Conversation {
  id: string;
  person: ConversationPerson;
  messages: ChatMessage[];
  unreadCount: number;
}

export interface ProfileData {
  name: string;
  age: string;
  height: string;
  job: string;
  bio: string;
  prompts: { question: string; answer: string }[];
  interests: string[];
}

interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  uploadedImages: { id: string; url: string; name: string; file?: File }[];
  setUploadedImages: (imgs: { id: string; url: string; name: string; file?: File }[]) => void;
  generatedRizz: string;
  setGeneratedRizz: (r: string) => void;
  ocrText: string;
  setOcrText: (t: string) => void;
  selectedTone: string;
  setSelectedTone: (t: string) => void;
  conversations: Conversation[];
  setConversations: (c: Conversation[]) => void;
  selectedMessageId: string | null;
  setSelectedMessageId: (id: string | null) => void;
  profileData: ProfileData;
  setProfileData: (p: ProfileData) => void;
  updateConversations: (updater: Conversation[] | ((prev: Conversation[]) => Conversation[])) => Promise<void>;
}

const defaultProfile: ProfileData = {
  name: "",
  age: "",
  height: "",
  job: "",
  bio: "",
  prompts: [
    { question: "Two truths and a lie", answer: "" },
    { question: "My love language is", answer: "" },
    { question: "A life goal of mine", answer: "" },
  ],
  interests: [],
};

const defaultConversations: Conversation[] = [];

const AppContext = createContext<AppContextType>({} as AppContextType);

// Helper to quickly save conversations to Firestore
import { setDoc } from "firebase/firestore";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; name: string; file?: File }[]>([]);
  const [generatedRizz, setGeneratedRizz] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [selectedTone, setSelectedTone] = useState("Witty");
  const [conversations, setConversations] = useState<Conversation[]>(defaultConversations);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);

  const updateConversations = async (updater: Conversation[] | ((prev: Conversation[]) => Conversation[])) => {
    setConversations(prev => {
      const newConvos = typeof updater === 'function' ? updater(prev) : updater;
      if (auth.currentUser) {
        setDoc(doc(db, "users", auth.currentUser.uid), {
          conversations: newConvos
        }, { merge: true }).catch(err => console.error("Failed to save conversations to Firebase", err));
      }
      return newConvos;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.profile) setProfileData(data.profile);
            if (data.conversations) setConversations(data.conversations);
          } else {
            setProfileData(defaultProfile);
            setConversations([]);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setProfileData(defaultProfile);
        setConversations([]);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        uploadedImages,
        setUploadedImages,
        generatedRizz,
        setGeneratedRizz,
        ocrText,
        setOcrText,
        selectedTone,
        setSelectedTone,
        conversations,
        setConversations,
        selectedMessageId,
        setSelectedMessageId,
        profileData,
        setProfileData,
        updateConversations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
