import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
  selectedTone: string;
  setSelectedTone: (t: string) => void;
  conversations: Conversation[];
  setConversations: (c: Conversation[]) => void;
  selectedMessageId: string | null;
  setSelectedMessageId: (id: string | null) => void;
  profileData: ProfileData;
  setProfileData: (p: ProfileData) => void;
}

const defaultProfile: ProfileData = {
  name: "Alex",
  age: "26",
  height: "5'11\"",
  job: "UX Designer at Spotify",
  bio: "Adventure-seeker by day, amateur chef by night. I believe in long hikes, great playlists, and even better conversations. Looking for someone to explore hidden gems and debate who makes the best tacos.",
  prompts: [
    {
      question: "Two truths and a lie",
      answer: "I've been to 30 countries. I can beatbox. I once shook hands with Gordon Ramsay.",
    },
    {
      question: "My love language is",
      answer: "Acts of service and spontaneous adventures on a Tuesday.",
    },
    {
      question: "A life goal of mine",
      answer: "Open a tiny coffee shop in a converted van and drive across the country.",
    },
  ],
  interests: ["Hiking", "Photography", "Cooking", "Vinyl Records", "Travel"],
};

const defaultConversations: Conversation[] = [
  {
    id: "sofia",
    person: {
      name: "Sofia",
      age: 24,
      photo: "https://images.unsplash.com/photo-1557353425-09253747c2bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      bio: "Trail runner & coffee snob ☕ I'll out-hike you and then make you the best espresso of your life.",
      interests: ["Hiking", "Trail Running", "Coffee", "Photography", "Yoga"],
      isOnline: true,
      lastSeen: "now",
      matchPercent: 94,
    },
    messages: [
      { id: "s1", text: "Hey! I saw you're into hiking — have you done any trails around here? 🏔️", isUser: true, time: "2:14 PM" },
      { id: "s2", text: "Oh yes! Just did Blue Ridge last weekend, it was stunning! Do you go often?", isUser: false, time: "2:16 PM" },
      { id: "s3", text: "Every chance I get! I'm actually planning a trip to Zion next month. Would love a trail buddy sometime 😄", isUser: true, time: "2:18 PM" },
      { id: "s4", text: "That sounds amazing!! Zion is on my bucket list. What else are you into besides hiking?", isUser: false, time: "2:22 PM" },
      { id: "s5", text: "Big into photography and vinyl records. You?", isUser: true, time: "2:24 PM" },
      { id: "s6", text: "No way — I literally just got my first record player last week!! What's on your current rotation?", isUser: false, time: "2:25 PM" },
    ],
    unreadCount: 1,
  },
  {
    id: "maya",
    person: {
      name: "Maya",
      age: 26,
      photo: "https://images.unsplash.com/photo-1621355737052-1429fb0b998f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      bio: "Filmmaker & street photographer. I see the world through a lens — sometimes 35mm, sometimes just vibes.",
      interests: ["Film Photography", "Cinema", "Travel", "Art", "Live Music"],
      isOnline: false,
      lastSeen: "2h ago",
      matchPercent: 87,
    },
    messages: [
      { id: "m1", text: "Your travel photos are incredible, do you shoot film or digital?", isUser: true, time: "Yesterday" },
      { id: "m2", text: "Mostly film! Just got back from shooting a short doc in Lisbon 🎬", isUser: false, time: "Yesterday" },
      { id: "m3", text: "That's so cool, what was it about?", isUser: true, time: "Yesterday" },
      { id: "m4", text: "A fado singer who performs only at 3am in unmarked locations. It was hauntingly beautiful 🌙", isUser: false, time: "11:02 AM" },
    ],
    unreadCount: 1,
  },
  {
    id: "priya",
    person: {
      name: "Priya",
      age: 23,
      photo: "https://images.unsplash.com/photo-1745869482293-902065d1ad5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      bio: "Pastry chef by training, chaos baker by heart 🧁 If you can appreciate a good croissant we'll get along fine.",
      interests: ["Baking", "Cooking", "Yoga", "Books", "Farmers Markets"],
      isOnline: true,
      lastSeen: "now",
      matchPercent: 81,
    },
    messages: [
      { id: "p1", text: "Okay your bio literally described my dream morning — coffee + farmers market 😍", isUser: true, time: "Mon" },
      { id: "p2", text: "Haha right?? I spend way too much money at farmers markets honestly", isUser: false, time: "Mon" },
      { id: "p3", text: "Is that even possible to spend too much? I think it's legally required to go overboard on heirloom tomatoes", isUser: true, time: "Mon" },
      { id: "p4", text: "Omg SAME. Also sourdough starter updates and fresh herbs I'll never use. We need to go together sometime 😂", isUser: false, time: "Mon" },
      { id: "p5", text: "Say less. I'm already thinking about which bag to bring", isUser: true, time: "Mon" },
    ],
    unreadCount: 0,
  },
  {
    id: "emma",
    person: {
      name: "Emma",
      age: 25,
      photo: "https://images.unsplash.com/photo-1762833656874-771c87d26c39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      bio: "Bookstore hopper & concert enthusiast 🎵 Looking for someone to share playlists and bad puns with.",
      interests: ["Live Music", "Reading", "Vinyl Records", "Coffee", "Dogs"],
      isOnline: false,
      lastSeen: "5h ago",
      matchPercent: 78,
    },
    messages: [
      { id: "e1", text: "Wait you have a record player AND you read?? Marry me 😂", isUser: true, time: "Sun" },
      { id: "e2", text: "Haha I'm flattered — what's your current read? 📖", isUser: false, time: "Sun" },
    ],
    unreadCount: 0,
  },
  {
    id: "zoe",
    person: {
      name: "Zoe",
      age: 27,
      photo: "https://images.unsplash.com/photo-1641808895769-29e63aa2f066?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      bio: "Serial traveler — 45 countries and counting ✈️ Work remotely so I'm probably somewhere that has good espresso and bad wifi.",
      interests: ["Travel", "Surfing", "Rock Climbing", "Photography", "Foodie"],
      isOnline: true,
      lastSeen: "now",
      matchPercent: 91,
    },
    messages: [
      { id: "z1", text: "45 countries is wild, what's been your favorite so far?", isUser: true, time: "Sat" },
      { id: "z2", text: "Impossible to pick one!! But Georgia (the country) broke my brain in the best way. You travel much?", isUser: false, time: "Sat" },
      { id: "z3", text: "Trying to! Zion next month is up first 🏜️", isUser: true, time: "Sat" },
    ],
    unreadCount: 2,
  },
];

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; name: string; file?: File }[]>([]);
  const [generatedRizz, setGeneratedRizz] = useState("");
  const [selectedTone, setSelectedTone] = useState("Witty");
  const [conversations, setConversations] = useState<Conversation[]>(defaultConversations);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      // Here we will eventually fetch profileData and conversations from Firestore
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
        selectedTone,
        setSelectedTone,
        conversations,
        setConversations,
        selectedMessageId,
        setSelectedMessageId,
        profileData,
        setProfileData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
