import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Instructor {
  id: string;
  name: string;
  rating: number;
  totalTrips: number;
  vehicle: string;
  platform: "Uber" | "Bolt" | "Wasili";
}

export interface Session {
  id: string;
  date: string;
  instructor: Instructor;
  platform: "Uber" | "Bolt" | "Wasili";
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  fare: number;
  premium: number;
  total: number;
  status: "upcoming" | "completed" | "cancelled";
  rating?: number;
  feedback?: string;
  skills: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseType: string;
  joinedDate: string;
}

interface AppContextType {
  user: UserProfile | null;
  sessions: Session[];
  addSession: (session: Session) => Promise<void>;
  rateSession: (
    sessionId: string,
    rating: number,
    feedback: string
  ) => Promise<void>;
  updateUser: (user: UserProfile) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: "i1",
    name: "Peter Kamau",
    rating: 4.9,
    totalTrips: 1240,
    vehicle: "Toyota Axio",
    platform: "Uber",
  },
  {
    id: "i2",
    name: "Grace Wanjiku",
    rating: 4.8,
    totalTrips: 870,
    vehicle: "Nissan Note",
    platform: "Bolt",
  },
  {
    id: "i3",
    name: "James Otieno",
    rating: 4.7,
    totalTrips: 620,
    vehicle: "Toyota Vitz",
    platform: "Wasili",
  },
];

const SEED_SESSIONS: Session[] = [
  {
    id: "s1",
    date: "2026-05-05T09:30:00",
    instructor: MOCK_INSTRUCTORS[0],
    platform: "Uber",
    pickup: "Westlands, Nairobi",
    destination: "CBD, Nairobi",
    distance: 8.4,
    duration: 42,
    fare: 350,
    premium: 105,
    total: 455,
    status: "completed",
    rating: 5,
    feedback: "Peter was patient and helpful. Great session!",
    skills: ["Lane discipline", "Roundabout navigation", "Hazard awareness"],
  },
  {
    id: "s2",
    date: "2026-05-08T14:00:00",
    instructor: MOCK_INSTRUCTORS[1],
    platform: "Bolt",
    pickup: "Kilimani, Nairobi",
    destination: "Karen, Nairobi",
    distance: 12.1,
    duration: 58,
    fare: 480,
    premium: 144,
    total: 624,
    status: "completed",
    rating: 4,
    feedback: "Good session on highway driving.",
    skills: ["Highway merging", "Speed management", "Mirror checks"],
  },
  {
    id: "s3",
    date: "2026-05-15T10:00:00",
    instructor: MOCK_INSTRUCTORS[2],
    platform: "Wasili",
    pickup: "Parklands, Nairobi",
    destination: "Thika Road Mall",
    distance: 15.3,
    duration: 70,
    fare: 600,
    premium: 180,
    total: 780,
    status: "upcoming",
    skills: ["Thika Road merging", "Rush hour navigation"],
  },
];

const DEFAULT_USER: UserProfile = {
  id: "u1",
  name: "David Mwangi",
  phone: "+254 712 345 678",
  licenseNumber: "DL-2025-NBI-04821",
  licenseType: "Class B (Light Motor Vehicle)",
  joinedDate: "2026-04-20",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [storedUser, storedSessions] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("sessions"),
        ]);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(DEFAULT_USER);
          await AsyncStorage.setItem("user", JSON.stringify(DEFAULT_USER));
        }

        if (storedSessions) {
          setSessions(JSON.parse(storedSessions));
        } else {
          setSessions(SEED_SESSIONS);
          await AsyncStorage.setItem(
            "sessions",
            JSON.stringify(SEED_SESSIONS)
          );
        }
      } catch (_e) {
        setUser(DEFAULT_USER);
        setSessions(SEED_SESSIONS);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const addSession = useCallback(async (session: Session) => {
    setSessions((prev) => {
      const next = [session, ...prev];
      AsyncStorage.setItem("sessions", JSON.stringify(next));
      return next;
    });
  }, []);

  const rateSession = useCallback(
    async (sessionId: string, rating: number, feedback: string) => {
      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === sessionId ? { ...s, rating, feedback, status: "completed" as const } : s
        );
        AsyncStorage.setItem("sessions", JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const updateUser = useCallback(async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AppContext.Provider
      value={{ user, sessions, addSession, rateSession, updateUser, isLoading }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { MOCK_INSTRUCTORS };
