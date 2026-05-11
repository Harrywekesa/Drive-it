import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Session } from "@/context/AppContext";

interface SessionCardProps {
  session: Session;
  onPress: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

const PLATFORM_COLORS: Record<string, string> = {
  Uber: "#000000",
  Bolt: "#34D186",
  Wasili: "#1D4ED8",
};

export function SessionCard({ session, onPress }: SessionCardProps) {
  const colors = useColors();

  const statusColor =
    session.status === "upcoming"
      ? colors.info
      : session.status === "completed"
      ? colors.success
      : colors.mutedForeground;

  const statusLabel =
    session.status === "upcoming"
      ? "Upcoming"
      : session.status === "completed"
      ? "Completed"
      : "Cancelled";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <View style={[styles.platformBadge, { backgroundColor: PLATFORM_COLORS[session.platform] + "18" }]}>
          <Text style={[styles.platformText, { color: PLATFORM_COLORS[session.platform] }]}>
            {session.platform}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeIconCol}>
          <View style={[styles.originDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
          <View style={[styles.destDot, { borderColor: colors.foreground }]} />
        </View>
        <View style={styles.routeTextCol}>
          <Text style={[styles.routeText, { color: colors.foreground }]} numberOfLines={1}>
            {session.pickup}
          </Text>
          <Text style={[styles.routeText, { color: colors.mutedForeground, marginTop: 8 }]} numberOfLines={1}>
            {session.destination}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {formatDate(session.date)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {formatTime(session.date)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {session.distance} km
          </Text>
        </View>
        <Text style={[styles.fare, { color: colors.foreground }]}>
          KSh {session.total.toLocaleString()}
        </Text>
      </View>

      {session.rating !== undefined && (
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Feather
              key={star}
              name="star"
              size={13}
              color={star <= session.rating! ? "#F59E0B" : colors.border}
              style={{ marginRight: 2 }}
            />
          ))}
          {session.feedback ? (
            <Text style={[styles.feedbackText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {session.feedback}
            </Text>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  platformBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  platformText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  routeRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  routeIconCol: {
    width: 20,
    alignItems: "center",
    marginRight: 10,
    paddingTop: 2,
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  destDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  routeTextCol: {
    flex: 1,
    justifyContent: "space-between",
  },
  routeText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  fare: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  feedbackText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginLeft: 6,
    flex: 1,
  },
});
