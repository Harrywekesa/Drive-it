import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Transaction, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type ProfileTab = "overview" | "transactions";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, sessions, transactions } = useApp();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const totalKm = completedSessions.reduce((sum, s) => sum + s.distance, 0);
  const totalSpent = transactions.filter((t) => t.status === "success").reduce((sum, t) => sum + t.amount, 0);
  const ratings = completedSessions.filter((s) => s.rating).map((s) => s.rating!);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : "—";

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const achievements = [
    { icon: "navigation", label: "First Session", earned: completedSessions.length >= 1 },
    { icon: "map", label: "10km Club", earned: totalKm >= 10 },
    { icon: "award", label: "5-Star Driver", earned: ratings.some((r) => r === 5) },
    { icon: "repeat", label: "Regular Driver", earned: completedSessions.length >= 3 },
    { icon: "shield", label: "Safety First", earned: completedSessions.length >= 1 },
    { icon: "trending-up", label: "High Spender", earned: totalSpent >= 1000 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Static Header */}
      <View style={[styles.topHeader, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <View style={styles.topHeaderRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/edit-profile")}
          >
            <Feather name="edit-2" size={16} color={colors.foreground} />
            <Text style={[styles.editBtnText, { color: colors.foreground }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>{user?.name.charAt(0).toUpperCase() ?? "D"}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name ?? "Driver"}</Text>
            <Text style={[styles.phone, { color: colors.mutedForeground }]}>{user?.phone}</Text>
          </View>
        </View>

        {/* License Card */}
        <View style={[styles.licenseCard, { backgroundColor: colors.primary }]}>
          <View style={styles.licenseHeader}>
            <Feather name="credit-card" size={18} color="#FFFFFF" />
            <Text style={styles.licenseTitle}>Driver's License</Text>
            <View style={[styles.ntsa, { backgroundColor: "#FFFFFF22" }]}>
              <Text style={styles.ntsaText}>NTSA</Text>
            </View>
          </View>
          <Text style={styles.licenseNumber}>{user?.licenseNumber}</Text>
          <Text style={styles.licenseType}>{user?.licenseType}</Text>
          <View style={[styles.licenseDivider, { backgroundColor: "#FFFFFF33" }]} />
          <View style={styles.licenseFooter}>
            <Text style={styles.licenseMeta}>Drive It Kenya</Text>
            <Text style={styles.licenseMeta}>
              Since {user?.joinedDate ? new Date(user.joinedDate).getFullYear() : "—"}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.secondary, borderRadius: 12 }]}>
          {(["overview", "transactions"] as ProfileTab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, { backgroundColor: activeTab === t ? colors.card : "transparent" }]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === t ? colors.foreground : colors.mutedForeground }]}>
                {t === "overview" ? "Overview" : "Transactions"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === "overview" ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats */}
          <View style={styles.statsGrid}>
            <StatItem label="Sessions" value={String(completedSessions.length)} icon="navigation" colors={colors} />
            <StatItem label="Km Driven" value={totalKm.toFixed(1)} icon="map" colors={colors} />
            <StatItem label="Avg Rating" value={avgRating} icon="star" colors={colors} />
            <StatItem label="KSh Spent" value={`${(totalSpent / 1000).toFixed(1)}k`} icon="trending-up" colors={colors} />
          </View>

          {/* Achievements */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((a) => (
              <View
                key={a.label}
                style={[styles.achievementBadge, {
                  backgroundColor: a.earned ? colors.primary + "18" : colors.secondary,
                  borderColor: a.earned ? colors.primary + "40" : colors.border,
                }]}
              >
                <Feather name={a.icon as any} size={22} color={a.earned ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.achievementLabel, { color: a.earned ? colors.primary : colors.mutedForeground }]}>
                  {a.label}
                </Text>
                {!a.earned && <Feather name="lock" size={10} color={colors.mutedForeground} />}
              </View>
            ))}
          </View>

          {/* About */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About Drive It</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow icon="users" label="Certified Instructors" value="NTSA-certified ride-hailing drivers" colors={colors} />
            <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
            <InfoRow icon="shield" label="Safety First" value="Dual-control. Full instructor override authority" colors={colors} />
            <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
            <InfoRow icon="phone" label="Support Line" value="+254 800 DRIVE IT" colors={colors} />
            <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
            <InfoRow icon="globe" label="Website" value="www.driveit.co.ke" colors={colors} />
          </View>
        </ScrollView>
      ) : (
        <FlatList<Transaction>
          data={transactions}
          keyExtractor={(t) => t.id}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyTx}>
              <Feather name="credit-card" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTxText, { color: colors.mutedForeground }]}>
                No transactions yet
              </Text>
            </View>
          }
          renderItem={({ item: tx }) => <TransactionCard tx={tx} colors={colors} />}
        />
      )}
    </View>
  );
}

function TransactionCard({ tx, colors }: { tx: Transaction; colors: any }) {
  const statusColor =
    tx.status === "success" ? "#00A651" : tx.status === "failed" ? colors.destructive : colors.warning;

  return (
    <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.txIconWrap, { backgroundColor: "#00A651" + "18" }]}>
        <Text style={[styles.txLogo, { color: "#00A651" }]}>M</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txDesc, { color: colors.foreground }]} numberOfLines={1}>
          {tx.description}
        </Text>
        <Text style={[styles.txMeta, { color: colors.mutedForeground }]}>
          {new Date(tx.date).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </Text>
        <Text style={[styles.txRef, { color: colors.mutedForeground }]}>Ref: {tx.mpesaRef}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: colors.foreground }]}>
          KSh {tx.amount.toLocaleString()}
        </Text>
        <View style={[styles.txStatus, { backgroundColor: statusColor + "18" }]}>
          <Text style={[styles.txStatusText, { color: statusColor }]}>
            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function StatItem({ label, value, icon, colors }: { label: string; value: string; icon: string; colors: any }) {
  return (
    <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon as any} size={18} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingHorizontal: 20, paddingBottom: 16 },
  topHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  editBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  avatarSection: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFF" },
  userName: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 2 },
  phone: { fontSize: 13, fontFamily: "Inter_400Regular" },
  licenseCard: { borderRadius: 18, padding: 18, marginBottom: 16 },
  licenseHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  licenseTitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#FFFFFFCC", flex: 1 },
  ntsa: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  ntsaText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: 1 },
  licenseNumber: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: 2, marginBottom: 2 },
  licenseType: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#FFFFFFAA" },
  licenseDivider: { height: 1, marginVertical: 12 },
  licenseFooter: { flexDirection: "row", justifyContent: "space-between" },
  licenseMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#FFFFFF88" },
  tabRow: { flexDirection: "row", padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  scrollContent: { padding: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  statItem: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center", gap: 6 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 14 },
  achievementsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  achievementBadge: { width: "47%", borderWidth: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 6 },
  achievementLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  infoCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  infoIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 1 },
  infoValue: { fontSize: 12, fontFamily: "Inter_400Regular" },
  infoDivider: { height: 1, marginLeft: 62 },
  txCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  txIconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  txLogo: { fontSize: 20, fontFamily: "Inter_700Bold" },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  txMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 1 },
  txRef: { fontSize: 11, fontFamily: "Inter_400Regular" },
  txRight: { alignItems: "flex-end", gap: 6 },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  txStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  txStatusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyTx: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTxText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
