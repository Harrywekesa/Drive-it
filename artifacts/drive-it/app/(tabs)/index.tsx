import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SessionCard } from "@/components/SessionCard";
import { StatCard } from "@/components/StatCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const PLATFORM_TIPS = [
  "Always check mirrors before every lane change.",
  "Maintain 3-second following distance in traffic.",
  "Slow down before entering roundabouts.",
  "Signal early — at least 30m before turning.",
  "Use engine braking going downhill.",
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, sessions } = useApp();

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === "completed");
    const totalKm = completed.reduce((sum, s) => sum + s.distance, 0);
    const avgRating =
      completed.filter((s) => s.rating).length > 0
        ? completed.filter((s) => s.rating).reduce((sum, s) => sum + (s.rating ?? 0), 0) /
          completed.filter((s) => s.rating).length
        : 0;
    return {
      completed: completed.length,
      totalKm: totalKm.toFixed(1),
      avgRating: avgRating > 0 ? avgRating.toFixed(1) : "—",
    };
  }, [sessions]);

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const recentSessions = sessions.filter((s) => s.status === "completed").slice(0, 2);
  const tip = PLATFORM_TIPS[new Date().getDay() % PLATFORM_TIPS.length];

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good {getGreeting()},
          </Text>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name.split(" ")[0] ?? "Driver"} 👋
          </Text>
        </View>
        <View style={[styles.badgeWrap, { backgroundColor: colors.primary + "18" }]}>
          <Feather name="shield" size={16} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>Certified</Text>
        </View>
      </View>

      {/* Book CTA */}
      <TouchableOpacity
        style={[styles.bookCard, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/book")}
        activeOpacity={0.85}
      >
        <View style={styles.bookCardContent}>
          <View>
            <Text style={styles.bookCardTitle}>Book a Drive It Session</Text>
            <Text style={styles.bookCardSub}>
              Practice with a certified instructor on your actual route
            </Text>
          </View>
          <View style={[styles.bookArrowWrap, { backgroundColor: "#FFFFFF22" }]}>
            <Feather name="arrow-right" size={22} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.bookMeta}>
          <View style={styles.bookMetaItem}>
            <Feather name="check-circle" size={13} color="#FFFFFF99" />
            <Text style={styles.bookMetaText}>Real traffic</Text>
          </View>
          <View style={styles.bookMetaItem}>
            <Feather name="check-circle" size={13} color="#FFFFFF99" />
            <Text style={styles.bookMetaText}>Live coaching</Text>
          </View>
          <View style={styles.bookMetaItem}>
            <Feather name="check-circle" size={13} color="#FFFFFF99" />
            <Text style={styles.bookMetaText}>Structured feedback</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Stats */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Progress</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="navigation"
          label="Sessions Done"
          value={String(stats.completed)}
          color={colors.primary}
        />
        <StatCard
          icon="map"
          label="km Driven"
          value={stats.totalKm}
          color={colors.info}
        />
        <StatCard
          icon="star"
          label="Avg Rating"
          value={stats.avgRating}
          color="#F59E0B"
        />
      </View>

      {/* Safety Tip */}
      <View style={[styles.tipCard, { backgroundColor: colors.primary + "0F", borderColor: colors.primary + "30" }]}>
        <View style={[styles.tipIconWrap, { backgroundColor: colors.primary }]}>
          <Feather name="alert-circle" size={16} color="#FFF" />
        </View>
        <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
      </View>

      {/* Upcoming */}
      {upcomingSessions.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming</Text>
          </View>
          {upcomingSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() => router.push(`/session/${session.id}`)}
            />
          ))}
        </>
      )}

      {/* Recent */}
      {recentSessions.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Sessions</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/sessions")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() => router.push(`/session/${session.id}`)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  badgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  bookCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  bookCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bookCardTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
    maxWidth: 220,
  },
  bookCardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFFCC",
    maxWidth: 220,
  },
  bookArrowWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  bookMeta: {
    flexDirection: "row",
    gap: 16,
  },
  bookMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  bookMetaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF99",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
  },
  tipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
  },
});
