import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const PLATFORM_COLORS: Record<string, string> = {
  Uber: "#000000",
  Bolt: "#34D186",
  Wasili: "#1D4ED8",
};

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions, rateSession } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const session = sessions.find((s) => s.id === id);

  const [rating, setRating] = useState(session?.rating ?? 0);
  const [feedback, setFeedback] = useState(session?.feedback ?? "");
  const [submitted, setSubmitted] = useState(!!session?.rating);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Session not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleSubmitRating() {
    if (rating === 0) {
      Alert.alert("Rating required", "Please select a star rating before submitting.");
      return;
    }
    await rateSession(session!.id, rating, feedback);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  }

  const platformColor = PLATFORM_COLORS[session.platform];
  const isUpcoming = session.status === "upcoming";
  const isCompleted = session.status === "completed";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Session Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: isUpcoming
                ? colors.info + "18"
                : isCompleted
                ? colors.primary + "18"
                : colors.secondary,
              borderColor: isUpcoming
                ? colors.info + "40"
                : isCompleted
                ? colors.primary + "40"
                : colors.border,
            },
          ]}
        >
          <Feather
            name={isUpcoming ? "clock" : isCompleted ? "check-circle" : "x-circle"}
            size={18}
            color={isUpcoming ? colors.info : isCompleted ? colors.primary : colors.mutedForeground}
          />
          <View>
            <Text
              style={[
                styles.statusTitle,
                {
                  color: isUpcoming
                    ? colors.info
                    : isCompleted
                    ? colors.primary
                    : colors.mutedForeground,
                },
              ]}
            >
              {isUpcoming ? "Upcoming Session" : isCompleted ? "Completed" : "Cancelled"}
            </Text>
            <Text style={[styles.statusDate, { color: colors.mutedForeground }]}>
              {formatDateTime(session.date)}
            </Text>
          </View>
        </View>

        {/* Route */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Route</Text>
          <View style={styles.routeRow}>
            <View style={styles.routeIconCol}>
              <View style={[styles.originDot, { backgroundColor: colors.primary }]} />
              <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
              <View style={[styles.destDot, { borderColor: colors.foreground }]} />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={[styles.routeText, { color: colors.foreground }]}>{session.pickup}</Text>
              <Text style={[styles.routeText, { color: colors.mutedForeground, marginTop: 12 }]}>
                {session.destination}
              </Text>
            </View>
          </View>
          <View style={styles.routeMetaRow}>
            <MetaBadge icon="map" value={`${session.distance} km`} colors={colors} />
            <MetaBadge icon="clock" value={`${session.duration} min`} colors={colors} />
            <MetaBadge icon="navigation" value={session.platform} colors={colors} color={platformColor} />
          </View>
        </View>

        {/* Instructor */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Instructor</Text>
          <View style={styles.instructorRow}>
            <View style={[styles.instructorAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{session.instructor.name.charAt(0)}</Text>
            </View>
            <View style={styles.instructorDetails}>
              <Text style={[styles.instructorName, { color: colors.foreground }]}>
                {session.instructor.name}
              </Text>
              <Text style={[styles.instructorVehicle, { color: colors.mutedForeground }]}>
                {session.instructor.vehicle}
              </Text>
              <View style={styles.ratingRow}>
                <Feather name="star" size={13} color="#F59E0B" />
                <Text style={[styles.ratingText, { color: colors.foreground }]}>
                  {session.instructor.rating}
                </Text>
                <Text style={[styles.tripsText, { color: colors.mutedForeground }]}>
                  · {session.instructor.totalTrips.toLocaleString()} trips
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skills */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Skills Practiced</Text>
          <View style={styles.skillsWrap}>
            {session.skills.map((skill) => (
              <View
                key={skill}
                style={[styles.skillChip, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "30" }]}
              >
                <Feather name="check" size={12} color={colors.primary} />
                <Text style={[styles.skillText, { color: colors.primary }]}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Pricing</Text>
          <PricingRow label="Standard Fare" value={`KSh ${session.fare}`} colors={colors} />
          <PricingRow label="Instructor Premium (30%)" value={`KSh ${session.premium}`} colors={colors} />
          <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />
          <PricingRow
            label="Total"
            value={`KSh ${session.total}`}
            colors={colors}
            bold
          />
        </View>

        {/* Rating */}
        {isCompleted && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {submitted ? "Your Rating" : "Rate this Session"}
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => {
                    if (!submitted) {
                      setRating(star);
                      Haptics.selectionAsync();
                    }
                  }}
                  disabled={submitted}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="star"
                    size={36}
                    color={star <= rating ? "#F59E0B" : colors.border}
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {!submitted && (
              <TextInput
                style={[
                  styles.feedbackInput,
                  { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
                ]}
                placeholder="Add feedback (optional)..."
                placeholderTextColor={colors.mutedForeground}
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={3}
              />
            )}
            {submitted && feedback ? (
              <Text style={[styles.feedbackReadOnly, { color: colors.mutedForeground }]}>
                "{feedback}"
              </Text>
            ) : null}
            {!submitted && (
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSubmitRating}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>Submit Rating</Text>
              </TouchableOpacity>
            )}
            {submitted && (
              <View style={[styles.thankYouCard, { backgroundColor: colors.primary + "14" }]}>
                <Feather name="check-circle" size={16} color={colors.primary} />
                <Text style={[styles.thankYouText, { color: colors.primary }]}>
                  Thank you for your feedback!
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MetaBadge({ icon, value, colors, color }: {
  icon: string; value: string; colors: any; color?: string;
}) {
  const c = color ?? colors.primary;
  return (
    <View style={[styles.metaBadge, { backgroundColor: c + "14", borderColor: c + "30" }]}>
      <Feather name={icon as any} size={13} color={c} />
      <Text style={[styles.metaBadgeText, { color: c }]}>{value}</Text>
    </View>
  );
}

function PricingRow({ label, value, colors, bold }: {
  label: string; value: string; colors: any; bold?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, { color: bold ? colors.foreground : colors.mutedForeground, fontFamily: bold ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
        {label}
      </Text>
      <Text style={[styles.priceValue, { color: colors.foreground, fontFamily: bold ? "Inter_700Bold" : "Inter_500Medium" }]}>
        {value}
      </Text>
    </View>
  );
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  statusTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  statusDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 14 },
  routeRow: { flexDirection: "row", marginBottom: 14 },
  routeIconCol: { width: 20, alignItems: "center", marginRight: 12, paddingTop: 2 },
  originDot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: { width: 2, flex: 1, marginVertical: 4 },
  destDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, backgroundColor: "transparent" },
  routeTextCol: { flex: 1, justifyContent: "space-between" },
  routeText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  routeMetaRow: { flexDirection: "row", gap: 8 },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  metaBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  instructorRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  instructorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFF" },
  instructorDetails: { flex: 1 },
  instructorName: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  instructorVehicle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tripsText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  skillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14 },
  priceDivider: { height: 1, marginVertical: 4 },
  starsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
  starIcon: { marginHorizontal: 4 },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  feedbackReadOnly: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginBottom: 12,
    lineHeight: 22,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  thankYouCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  thankYouText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  errorText: { fontSize: 16, fontFamily: "Inter_500Medium", marginBottom: 12 },
  backLink: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
