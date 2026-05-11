import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, sessions } = useApp();

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const totalKm = completedSessions.reduce((sum, s) => sum + s.distance, 0);
  const totalSpent = completedSessions.reduce((sum, s) => sum + s.total, 0);
  const ratings = completedSessions.filter((s) => s.rating).map((s) => s.rating!);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : "—";

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const achievements = [
    { icon: "navigation", label: "First Session", earned: completedSessions.length >= 1 },
    { icon: "map", label: "10km Club", earned: totalKm >= 10 },
    { icon: "award", label: "5-Star Driver", earned: ratings.some((r) => r === 5) },
    { icon: "repeat", label: "Regular", earned: completedSessions.length >= 3 },
  ];

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
      {/* Avatar & Name */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarInitial}>
            {user?.name.charAt(0).toUpperCase() ?? "D"}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.foreground }]}>
          {user?.name ?? "Driver"}
        </Text>
        <Text style={[styles.phone, { color: colors.mutedForeground }]}>
          {user?.phone}
        </Text>
      </View>

      {/* License Card */}
      <View style={[styles.licenseCard, { backgroundColor: colors.primary }]}>
        <View style={styles.licenseHeader}>
          <Feather name="credit-card" size={20} color="#FFFFFF" />
          <Text style={styles.licenseTitle}>Driver's License</Text>
        </View>
        <Text style={styles.licenseNumber}>{user?.licenseNumber}</Text>
        <Text style={styles.licenseType}>{user?.licenseType}</Text>
        <View style={[styles.licenseDivider, { backgroundColor: "#FFFFFF33" }]} />
        <Text style={styles.licenseMeta}>
          Joined Drive It: {user?.joinedDate ? formatDate(user.joinedDate) : "—"}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatItem label="Sessions" value={String(completedSessions.length)} icon="navigation" colors={colors} />
        <StatItem label="Km Driven" value={totalKm.toFixed(1)} icon="map" colors={colors} />
        <StatItem label="Avg Rating" value={avgRating} icon="star" colors={colors} />
        <StatItem label="KSh Invested" value={`${(totalSpent / 1000).toFixed(1)}k`} icon="trending-up" colors={colors} />
      </View>

      {/* Achievements */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>
      <View style={styles.achievementsRow}>
        {achievements.map((a) => (
          <View
            key={a.label}
            style={[
              styles.achievementBadge,
              {
                backgroundColor: a.earned ? colors.primary + "18" : colors.secondary,
                borderColor: a.earned ? colors.primary + "40" : colors.border,
              },
            ]}
          >
            <Feather
              name={a.icon as any}
              size={22}
              color={a.earned ? colors.primary : colors.mutedForeground}
            />
            <Text
              style={[
                styles.achievementLabel,
                { color: a.earned ? colors.primary : colors.mutedForeground },
              ]}
            >
              {a.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Info Rows */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About Drive It</Text>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow icon="users" label="Certified Instructors" value="Active ride-hailing drivers with NTSA certification" colors={colors} />
        <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
        <InfoRow icon="shield" label="Safety First" value="Dual-control preferred. Instructors hold full override authority" colors={colors} />
        <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
        <InfoRow icon="phone" label="Support" value="+254 800 DRIVE IT" colors={colors} />
      </View>
    </ScrollView>
  );
}

function StatItem({ label, value, icon, colors }: {
  label: string; value: string; icon: string; colors: any;
}) {
  return (
    <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon as any} size={18} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }: {
  icon: string; label: string; value: string; colors: any;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, { backgroundColor: colors.primary + "18" }]}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.mutedForeground }]}>{value}</Text>
      </View>
    </View>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarInitial: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#FFF" },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  phone: { fontSize: 14, fontFamily: "Inter_400Regular" },
  licenseCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  licenseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  licenseTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFFCC" },
  licenseNumber: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: 2, marginBottom: 4 },
  licenseType: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#FFFFFFAA" },
  licenseDivider: { height: 1, marginVertical: 14 },
  licenseMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#FFFFFF88" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  statItem: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 14 },
  achievementsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  achievementBadge: {
    width: "47%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  achievementLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  infoCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  infoValue: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  infoDivider: { height: 1, marginLeft: 66 },
});
