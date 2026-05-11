import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { MOCK_INSTRUCTORS, Session, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Platform_ = "Uber" | "Bolt" | "Wasili";

const PLATFORMS: { key: Platform_; icon: string; color: string; desc: string }[] = [
  { key: "Uber", icon: "truck", color: "#000000", desc: "Available in all Nairobi zones" },
  { key: "Bolt", icon: "zap", color: "#34D186", desc: "Fast pickups, CBD & estates" },
  { key: "Wasili", icon: "compass", color: "#1D4ED8", desc: "Local routes & highways" },
];

const NAIROBI_AREAS = [
  "Westlands", "Kilimani", "Parklands", "Lavington", "Karen",
  "CBD Nairobi", "Thika Road", "Langata", "Hurlingham", "Gigiri",
  "South B", "South C", "Buruburu", "Donholm", "Eastleigh",
];

export default function BookScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addSession } = useApp();

  const [step, setStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform_ | null>(null);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<typeof MOCK_INSTRUCTORS[0] | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filteredInstructors = MOCK_INSTRUCTORS.filter(
    (i) => !selectedPlatform || i.platform === selectedPlatform
  );

  async function handleConfirm() {
    if (!selectedPlatform || !pickup || !destination || !selectedInstructor) return;
    setIsBooking(true);
    await new Promise((r) => setTimeout(r, 1200));

    const distance = parseFloat((Math.random() * 12 + 4).toFixed(1));
    const fare = Math.round(distance * 40);
    const premium = Math.round(fare * 0.3);
    const session: Session = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      instructor: selectedInstructor,
      platform: selectedPlatform,
      pickup,
      destination,
      distance,
      duration: Math.round(distance * 5),
      fare,
      premium,
      total: fare + premium,
      status: "upcoming",
      skills: getSkillsForRoute(pickup, destination),
    };

    await addSession(session);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsBooking(false);
    router.replace(`/session/${session.id}`);
  }

  const steps = ["Platform", "Route", "Instructor", "Confirm"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Book a Session</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step indicators */}
      <View style={[styles.stepBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {steps.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: i <= step ? colors.primary : colors.secondary,
                  borderColor: i === step ? colors.primary : "transparent",
                },
              ]}
            >
              {i < step ? (
                <Feather name="check" size={12} color="#FFF" />
              ) : (
                <Text style={[styles.stepNum, { color: i <= step ? "#FFF" : colors.mutedForeground }]}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                { color: i <= step ? colors.primary : colors.mutedForeground },
              ]}
            >
              {s}
            </Text>
            {i < steps.length - 1 && (
              <View
                style={[styles.stepLine, { backgroundColor: i < step ? colors.primary : colors.border }]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step 0: Platform */}
        {step === 0 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choose your platform</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Select the ride-hailing app to book through
            </Text>
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.platformCard,
                  {
                    backgroundColor: selectedPlatform === p.key ? p.color + "12" : colors.card,
                    borderColor: selectedPlatform === p.key ? p.color : colors.border,
                  },
                ]}
                onPress={() => { setSelectedPlatform(p.key); Haptics.selectionAsync(); }}
                activeOpacity={0.75}
              >
                <View style={[styles.platformIconWrap, { backgroundColor: p.color + "18" }]}>
                  <Feather name={p.icon as any} size={22} color={p.color} />
                </View>
                <View style={styles.platformTextWrap}>
                  <Text style={[styles.platformName, { color: colors.foreground }]}>{p.key}</Text>
                  <Text style={[styles.platformDesc, { color: colors.mutedForeground }]}>{p.desc}</Text>
                </View>
                {selectedPlatform === p.key && (
                  <Feather name="check-circle" size={22} color={p.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 1: Route */}
        {step === 1 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Your route</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Enter your pickup and destination
            </Text>
            <View style={[styles.routeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                <TextInput
                  style={[styles.routeInput, { color: colors.foreground }]}
                  placeholder="Pickup location"
                  placeholderTextColor={colors.mutedForeground}
                  value={pickup}
                  onChangeText={setPickup}
                />
              </View>
              <View style={[styles.routeSeparator, { backgroundColor: colors.border }]} />
              <View style={styles.routeRow}>
                <View style={[styles.routeDotDest, { borderColor: colors.foreground }]} />
                <TextInput
                  style={[styles.routeInput, { color: colors.foreground }]}
                  placeholder="Destination"
                  placeholderTextColor={colors.mutedForeground}
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
            </View>
            <Text style={[styles.suggestLabel, { color: colors.mutedForeground }]}>Suggestions</Text>
            <View style={styles.suggestWrap}>
              {NAIROBI_AREAS.slice(0, 8).map((area) => (
                <TouchableOpacity
                  key={area}
                  style={[styles.suggestChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => {
                    if (!pickup) setPickup(area);
                    else setDestination(area);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[styles.suggestText, { color: colors.foreground }]}>{area}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Instructor */}
        {step === 2 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choose instructor</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Certified {selectedPlatform} instructors near you
            </Text>
            {filteredInstructors.map((inst) => (
              <TouchableOpacity
                key={inst.id}
                style={[
                  styles.instructorCard,
                  {
                    backgroundColor: selectedInstructor?.id === inst.id ? colors.primary + "0F" : colors.card,
                    borderColor: selectedInstructor?.id === inst.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => { setSelectedInstructor(inst); Haptics.selectionAsync(); }}
                activeOpacity={0.75}
              >
                <View style={[styles.instructorAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.instructorAvatarText}>{inst.name.charAt(0)}</Text>
                </View>
                <View style={styles.instructorInfo}>
                  <Text style={[styles.instructorName, { color: colors.foreground }]}>{inst.name}</Text>
                  <Text style={[styles.instructorVehicle, { color: colors.mutedForeground }]}>
                    {inst.vehicle}
                  </Text>
                  <View style={styles.instructorMeta}>
                    <Feather name="star" size={13} color="#F59E0B" />
                    <Text style={[styles.instructorRating, { color: colors.foreground }]}>
                      {inst.rating}
                    </Text>
                    <Text style={[styles.instructorTrips, { color: colors.mutedForeground }]}>
                      · {inst.totalTrips.toLocaleString()} trips
                    </Text>
                  </View>
                </View>
                {selectedInstructor?.id === inst.id && (
                  <Feather name="check-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedPlatform && selectedInstructor && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Confirm Booking</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Review your session details
            </Text>
            <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ConfirmRow label="Platform" value={selectedPlatform} colors={colors} />
              <ConfirmRow label="Instructor" value={selectedInstructor.name} colors={colors} />
              <ConfirmRow label="Vehicle" value={selectedInstructor.vehicle} colors={colors} />
              <ConfirmRow label="Pickup" value={pickup} colors={colors} />
              <ConfirmRow label="Destination" value={destination} colors={colors} />
              <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
              <View style={[styles.pricingCard, { backgroundColor: colors.primary + "0F" }]}>
                <Feather name="info" size={15} color={colors.primary} />
                <Text style={[styles.pricingText, { color: colors.foreground }]}>
                  Standard fare + 30% instructor premium. Final amount calculated on completion.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 12,
          },
        ]}
      >
        {step > 0 && (
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={() => setStep((s) => s - 1)}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: canProceed(step, selectedPlatform, pickup, destination, selectedInstructor) ? colors.primary : colors.secondary },
          ]}
          onPress={() => {
            if (!canProceed(step, selectedPlatform, pickup, destination, selectedInstructor)) return;
            if (step < 3) {
              setStep((s) => s + 1);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
              handleConfirm();
            }
          }}
          disabled={isBooking}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.nextButtonText,
              {
                color: canProceed(step, selectedPlatform, pickup, destination, selectedInstructor)
                  ? "#FFF"
                  : colors.mutedForeground,
              },
            ]}
          >
            {isBooking ? "Booking..." : step === 3 ? "Confirm Booking" : "Continue"}
          </Text>
          {!isBooking && (
            <Feather
              name={step === 3 ? "check" : "arrow-right"}
              size={18}
              color={canProceed(step, selectedPlatform, pickup, destination, selectedInstructor) ? "#FFF" : colors.mutedForeground}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ConfirmRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.confirmRow}>
      <Text style={[styles.confirmLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.confirmValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function canProceed(
  step: number,
  platform: Platform_ | null,
  pickup: string,
  destination: string,
  instructor: typeof MOCK_INSTRUCTORS[0] | null
): boolean {
  if (step === 0) return !!platform;
  if (step === 1) return pickup.trim().length >= 3 && destination.trim().length >= 3;
  if (step === 2) return !!instructor;
  return true;
}

function getSkillsForRoute(pickup: string, destination: string): string[] {
  const all = [
    "Lane discipline", "Roundabout navigation", "Hazard awareness",
    "Mirror checks", "Highway merging", "Speed management",
    "Pedestrian awareness", "Parking manoeuvres", "Rush hour navigation",
  ];
  const n = Math.floor(Math.random() * 2) + 2;
  return all.slice(0, n);
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
  stepBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginBottom: 4,
  },
  stepNum: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  stepLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  stepLine: {
    position: "absolute",
    top: 13,
    right: -"50%",
    width: "100%",
    height: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6 },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20, lineHeight: 22 },
  platformCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 14,
  },
  platformIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  platformTextWrap: { flex: 1 },
  platformName: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  platformDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  routeCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeDotDest: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  routeInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  routeSeparator: { height: 1, marginLeft: 38 },
  suggestLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 10 },
  suggestWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  instructorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 14,
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  instructorAvatarText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
  },
  instructorInfo: { flex: 1 },
  instructorName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  instructorVehicle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  instructorMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  instructorRating: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  instructorTrips: { fontSize: 13, fontFamily: "Inter_400Regular" },
  confirmCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: "center",
  },
  confirmLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  confirmValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", maxWidth: "60%", textAlign: "right" },
  confirmDivider: { height: 1, marginHorizontal: 0 },
  pricingCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    margin: 16,
    borderRadius: 10,
    padding: 12,
  },
  pricingText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 20 },
  footer: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
