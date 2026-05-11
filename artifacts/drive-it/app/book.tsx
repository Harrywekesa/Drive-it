import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MpesaModal } from "@/components/MpesaModal";
import { MOCK_INSTRUCTORS, Session, Transaction, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type PlatformKey = "Uber" | "Bolt" | "Wasili";

const PLATFORMS: { key: PlatformKey; icon: string; color: string; desc: string }[] = [
  { key: "Uber", icon: "truck", color: "#000000", desc: "Available in all Nairobi zones" },
  { key: "Bolt", icon: "zap", color: "#34D186", desc: "Fast pickups, CBD & estates" },
  { key: "Wasili", icon: "compass", color: "#1D4ED8", desc: "Local routes & highways" },
];

const NAIROBI_AREAS = [
  "Westlands", "Kilimani", "Parklands", "Lavington", "Karen",
  "CBD Nairobi", "Thika Road", "Langata", "Hurlingham", "Gigiri",
  "South B", "South C", "Buruburu", "Donholm", "Eastleigh",
];

const STEPS = ["Platform", "Route", "Instructor", "Confirm", "Pay"];

export default function BookScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addSession, addTransaction } = useApp();

  const [step, setStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey | null>(null);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<typeof MOCK_INSTRUCTORS[0] | null>(null);
  const [showMpesa, setShowMpesa] = useState(false);
  const [pendingSession, setPendingSession] = useState<Session | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filteredInstructors = MOCK_INSTRUCTORS.filter(
    (i) => !selectedPlatform || i.platform === selectedPlatform
  );

  const distance = pendingSession?.distance ?? estimateDistance(pickup, destination);
  const fare = Math.round(distance * 40);
  const premium = Math.round(fare * 0.3);
  const total = fare + premium;

  function buildSession(): Session {
    const dist = estimateDistance(pickup, destination);
    const f = Math.round(dist * 40);
    const p = Math.round(f * 0.3);
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      instructor: selectedInstructor!,
      platform: selectedPlatform!,
      pickup,
      destination,
      distance: dist,
      duration: Math.round(dist * 5),
      fare: f,
      premium: p,
      total: f + p,
      status: "upcoming",
      skills: getSkillsForRoute(pickup, destination),
      paymentStatus: "pending",
    };
  }

  function handleProceedToPayment() {
    const session = buildSession();
    setPendingSession(session);
    setShowMpesa(true);
  }

  async function handlePaymentSuccess(mpesaRef: string) {
    setShowMpesa(false);
    if (!pendingSession || !user) return;

    const finalSession: Session = {
      ...pendingSession,
      mpesaRef,
      paymentStatus: "paid",
    };

    const tx: Transaction = {
      id: "tx" + Date.now(),
      date: new Date().toISOString(),
      sessionId: finalSession.id,
      amount: finalSession.total,
      phone: user.phone,
      mpesaRef,
      status: "success",
      description: `Drive It Session — ${pickup} to ${destination}`,
    };

    await addSession(finalSession);
    await addTransaction(tx);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(`/session/${finalSession.id}`);
  }

  function handlePaymentFailure() {
    setShowMpesa(false);
    setPendingSession(null);
  }

  const canProceed = (() => {
    if (step === 0) return !!selectedPlatform;
    if (step === 1) return pickup.trim().length >= 3 && destination.trim().length >= 3;
    if (step === 2) return !!selectedInstructor;
    return true;
  })();

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
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, { backgroundColor: i <= step ? colors.primary : colors.secondary }]}>
              {i < step ? (
                <Feather name="check" size={11} color="#FFF" />
              ) : (
                <Text style={[styles.stepNum, { color: i <= step ? "#FFF" : colors.mutedForeground }]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, { color: i <= step ? colors.primary : colors.mutedForeground }]}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 110 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step 0: Platform */}
        {step === 0 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choose your platform</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Select the ride-hailing app you want to book through
            </Text>
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[styles.optionCard, {
                  backgroundColor: selectedPlatform === p.key ? p.color + "12" : colors.card,
                  borderColor: selectedPlatform === p.key ? p.color : colors.border,
                }]}
                onPress={() => { setSelectedPlatform(p.key); Haptics.selectionAsync(); }}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIcon, { backgroundColor: p.color + "18" }]}>
                  <Feather name={p.icon as any} size={22} color={p.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.foreground }]}>{p.key}</Text>
                  <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{p.desc}</Text>
                </View>
                {selectedPlatform === p.key && <Feather name="check-circle" size={22} color={p.color} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 1: Route */}
        {step === 1 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Your route</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Where are you starting and where do you want to go?
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
              <View style={[styles.routeSep, { backgroundColor: colors.border }]} />
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
            <Text style={[styles.suggestLabel, { color: colors.mutedForeground }]}>Popular areas</Text>
            <View style={styles.chips}>
              {NAIROBI_AREAS.map((area) => (
                <TouchableOpacity
                  key={area}
                  style={[styles.chip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => {
                    if (!pickup) setPickup(area);
                    else if (!destination) setDestination(area);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[styles.chipText, { color: colors.foreground }]}>{area}</Text>
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
              NTSA-certified {selectedPlatform} instructors near you
            </Text>
            {filteredInstructors.map((inst) => (
              <TouchableOpacity
                key={inst.id}
                style={[styles.optionCard, {
                  backgroundColor: selectedInstructor?.id === inst.id ? colors.primary + "0F" : colors.card,
                  borderColor: selectedInstructor?.id === inst.id ? colors.primary : colors.border,
                }]}
                onPress={() => { setSelectedInstructor(inst); Haptics.selectionAsync(); }}
                activeOpacity={0.75}
              >
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{inst.name.charAt(0)}</Text>
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.foreground }]}>{inst.name}</Text>
                  <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{inst.vehicle}</Text>
                  <View style={styles.ratingRow}>
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text style={[styles.ratingText, { color: colors.foreground }]}>{inst.rating}</Text>
                    <Text style={[styles.tripsText, { color: colors.mutedForeground }]}>
                      · {inst.totalTrips.toLocaleString()} trips
                    </Text>
                  </View>
                </View>
                {selectedInstructor?.id === inst.id && <Feather name="check-circle" size={22} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedPlatform && selectedInstructor && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Pay</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              Confirm your session details before M-Pesa payment
            </Text>
            <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ConfirmRow label="Platform" value={selectedPlatform} colors={colors} />
              <ConfirmRow label="Instructor" value={selectedInstructor.name} colors={colors} />
              <ConfirmRow label="Vehicle" value={selectedInstructor.vehicle} colors={colors} />
              <ConfirmRow label="Pickup" value={pickup} colors={colors} />
              <ConfirmRow label="Destination" value={destination} colors={colors} />
            </View>

            {/* Pricing summary */}
            <View style={[styles.pricingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.pricingTitle, { color: colors.foreground }]}>Payment Breakdown</Text>
              <PricingRow label="Estimated Distance" value={`~${distance} km`} colors={colors} />
              <PricingRow label="Standard Fare" value={`KSh ${fare}`} colors={colors} />
              <PricingRow label="Instructor Premium (30%)" value={`KSh ${premium}`} colors={colors} />
              <View style={[styles.pricingDivider, { backgroundColor: colors.border }]} />
              <PricingRow label="Total" value={`KSh ${total}`} colors={colors} bold />
            </View>

            {/* M-Pesa notice */}
            <View style={[styles.mpesaNotice, { backgroundColor: "#00A651" + "14", borderColor: "#00A651" + "40" }]}>
              <Text style={[styles.mpesaNoticeLogo, { color: "#00A651" }]}>M-PESA</Text>
              <Text style={[styles.mpesaNoticeText, { color: colors.foreground }]}>
                Payment will be requested via M-Pesa STK Push to{" "}
                <Text style={{ fontFamily: "Inter_600SemiBold", color: "#00A651" }}>{user?.phone}</Text>
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
        {step > 0 && (
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={() => setStep((s) => s - 1)}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: canProceed ? colors.primary : colors.secondary }]}
          onPress={() => {
            if (!canProceed) return;
            if (step < 3) {
              setStep((s) => s + 1);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
              handleProceedToPayment();
            }
          }}
          activeOpacity={0.85}
        >
          {step === 3 ? (
            <>
              <Text style={[styles.nextButtonText, { color: canProceed ? "#FFF" : colors.mutedForeground }]}>
                Pay with M-Pesa
              </Text>
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: canProceed ? "#FFF" : colors.mutedForeground, letterSpacing: 1 }}>
                M-PESA
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.nextButtonText, { color: canProceed ? "#FFF" : colors.mutedForeground }]}>
                Continue
              </Text>
              <Feather name="arrow-right" size={18} color={canProceed ? "#FFF" : colors.mutedForeground} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* M-Pesa Modal */}
      <MpesaModal
        visible={showMpesa}
        phone={user?.phone ?? "+254 7XX XXX XXX"}
        amount={pendingSession?.total ?? total}
        description={`Drive It Session — ${pickup} to ${destination}`}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onClose={() => setShowMpesa(false)}
      />
    </View>
  );
}

function ConfirmRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.confirmRow}>
      <Text style={[styles.confirmLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.confirmValue, { color: colors.foreground }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function PricingRow({ label, value, colors, bold }: { label: string; value: string; colors: any; bold?: boolean }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, { color: bold ? colors.foreground : colors.mutedForeground, fontFamily: bold ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{label}</Text>
      <Text style={[styles.priceValue, { color: colors.foreground, fontFamily: bold ? "Inter_700Bold" : "Inter_500Medium" }]}>{value}</Text>
    </View>
  );
}

function estimateDistance(pickup: string, dest: string): number {
  const seed = (pickup.length + dest.length) % 13;
  return parseFloat((5 + seed * 0.9).toFixed(1));
}

function getSkillsForRoute(_pickup: string, _dest: string): string[] {
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  stepBar: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, justifyContent: "space-between" },
  stepItem: { flex: 1, alignItems: "center" },
  stepDot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  stepNum: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  stepLabel: { fontSize: 9, fontFamily: "Inter_500Medium" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6 },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20, lineHeight: 22 },
  optionCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1.5, marginBottom: 12, gap: 14 },
  optionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  optionDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFF" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  ratingText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tripsText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  routeCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  routeRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeDotDest: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, backgroundColor: "transparent" },
  routeInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  routeSep: { height: 1, marginLeft: 38 },
  suggestLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  confirmCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  confirmRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13, alignItems: "center" },
  confirmLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  confirmValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", maxWidth: "55%", textAlign: "right" },
  pricingCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  pricingTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14 },
  pricingDivider: { height: 1, marginVertical: 6 },
  mpesaNotice: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  mpesaNoticeLogo: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2, marginTop: 1 },
  mpesaNoticeText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 20 },
  footer: { flexDirection: "row", padding: 20, paddingTop: 12, borderTopWidth: 1, gap: 12 },
  backButton: { width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  nextButton: { flex: 1, height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  nextButtonText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
