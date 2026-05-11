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
  phone: string;
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
  status: "upcoming" | "active" | "completed" | "cancelled";
  rating?: number;
  feedback?: string;
  skills: string[];
  mpesaRef?: string;
  paymentStatus: "paid" | "pending";
}

export interface Transaction {
  id: string;
  date: string;
  sessionId: string;
  amount: number;
  phone: string;
  mpesaRef: string;
  status: "success" | "failed" | "pending";
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseType: string;
  joinedDate: string;
  balance: number;
}

interface AppContextType {
  user: UserProfile | null;
  sessions: Session[];
  transactions: Transaction[];
  addSession: (session: Session) => Promise<void>;
  rateSession: (sessionId: string, rating: number, feedback: string) => Promise<void>;
  startSession: (sessionId: string) => Promise<void>;
  completeSession: (sessionId: string) => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  updateUser: (user: UserProfile) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: "i1",
    name: "Peter Kamau",
    rating: 4.9,
    totalTrips: 1240,
    vehicle: "Toyota Axio",
    platform: "Uber",
    phone: "+254 712 100 001",
  },
  {
    id: "i2",
    name: "Grace Wanjiku",
    rating: 4.8,
    totalTrips: 870,
    vehicle: "Nissan Note",
    platform: "Bolt",
    phone: "+254 722 200 002",
  },
  {
    id: "i3",
    name: "James Otieno",
    rating: 4.7,
    totalTrips: 620,
    vehicle: "Toyota Vitz",
    platform: "Wasili",
    phone: "+254 733 300 003",
  },
  {
    id: "i4",
    name: "Faith Akinyi",
    rating: 4.8,
    totalTrips: 450,
    vehicle: "Mazda Demio",
    platform: "Uber",
    phone: "+254 700 400 004",
  },
  {
    id: "i5",
    name: "Samuel Kipchoge",
    rating: 4.6,
    totalTrips: 310,
    vehicle: "Suzuki Swift",
    platform: "Bolt",
    phone: "+254 711 500 005",
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
    mpesaRef: "QH7X9K2L4M",
    paymentStatus: "paid",
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
    mpesaRef: "QK3P8N5R7S",
    paymentStatus: "paid",
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
    mpesaRef: "QL9M2T6W1X",
    paymentStatus: "paid",
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx1",
    date: "2026-05-05T09:15:00",
    sessionId: "s1",
    amount: 455,
    phone: "+254 712 345 678",
    mpesaRef: "QH7X9K2L4M",
    status: "success",
    description: "Drive It Session — Westlands to CBD",
  },
  {
    id: "tx2",
    date: "2026-05-08T13:45:00",
    sessionId: "s2",
    amount: 624,
    phone: "+254 712 345 678",
    mpesaRef: "QK3P8N5R7S",
    status: "success",
    description: "Drive It Session — Kilimani to Karen",
  },
  {
    id: "tx3",
    date: "2026-05-10T10:00:00",
    sessionId: "s3",
    amount: 780,
    phone: "+254 712 345 678",
    mpesaRef: "QL9M2T6W1X",
    status: "success",
    description: "Drive It Session — Parklands to Thika Road Mall",
  },
];

const DEFAULT_USER: UserProfile = {
  id: "u1",
  name: "David Mwangi",
  phone: "+254 712 345 678",
  licenseNumber: "DL-2025-NBI-04821",
  licenseType: "Class B (Light Motor Vehicle)",
  joinedDate: "2026-04-20",
  balance: 2500,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [storedUser, storedSessions, storedTx] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("sessions"),
          AsyncStorage.getItem("transactions"),
        ]);

        setUser(storedUser ? JSON.parse(storedUser) : DEFAULT_USER);
        if (!storedUser) await AsyncStorage.setItem("user", JSON.stringify(DEFAULT_USER));

        setSessions(storedSessions ? JSON.parse(storedSessions) : SEED_SESSIONS);
        if (!storedSessions) await AsyncStorage.setItem("sessions", JSON.stringify(SEED_SESSIONS));

        setTransactions(storedTx ? JSON.parse(storedTx) : SEED_TRANSACTIONS);
        if (!storedTx) await AsyncStorage.setItem("transactions", JSON.stringify(SEED_TRANSACTIONS));
      } catch (_e) {
        setUser(DEFAULT_USER);
        setSessions(SEED_SESSIONS);
        setTransactions(SEED_TRANSACTIONS);
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

  const rateSession = useCallback(async (sessionId: string, rating: number, feedback: string) => {
    setSessions((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId ? { ...s, rating, feedback, status: "completed" as const } : s
      );
      AsyncStorage.setItem("sessions", JSON.stringify(next));
      return next;
    });
  }, []);

  const startSession = useCallback(async (sessionId: string) => {
    setSessions((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId ? { ...s, status: "active" as const } : s
      );
      AsyncStorage.setItem("sessions", JSON.stringify(next));
      return next;
    });
  }, []);

  const completeSession = useCallback(async (sessionId: string) => {
    setSessions((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId ? { ...s, status: "completed" as const } : s
      );
      AsyncStorage.setItem("sessions", JSON.stringify(next));
      return next;
    });
  }, []);

  const cancelSession = useCallback(async (sessionId: string) => {
    setSessions((prev) => {
      const next = prev.map((s) =>
        s.id === sessionId ? { ...s, status: "cancelled" as const } : s
      );
      AsyncStorage.setItem("sessions", JSON.stringify(next));
      return next;
    });
  }, []);

  const addTransaction = useCallback(async (tx: Transaction) => {
    setTransactions((prev) => {
      const next = [tx, ...prev];
      AsyncStorage.setItem("transactions", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateUser = useCallback(async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        sessions,
        transactions,
        addSession,
        rateSession,
        startSession,
        completeSession,
        cancelSession,
        addTransaction,
        updateUser,
        isLoading,
      }}
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
