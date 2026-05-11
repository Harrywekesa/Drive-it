import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

export type MpesaState = "idle" | "sending" | "waiting" | "processing" | "success" | "failed";

interface MpesaModalProps {
  visible: boolean;
  phone: string;
  amount: number;
  description: string;
  onSuccess: (mpesaRef: string) => void;
  onFailure: () => void;
  onClose: () => void;
}

function generateRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function Dot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[styles.dot, { opacity }]} />
  );
}

export function MpesaModal({
  visible,
  phone,
  amount,
  description,
  onSuccess,
  onFailure,
  onClose,
}: MpesaModalProps) {
  const colors = useColors();
  const [state, setState] = useState<MpesaState>("idle");
  const [mpesaRef] = useState(generateRef);
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      setState("sending");
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();

      const t1 = setTimeout(() => {
        setState("waiting");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 1500);

      const t2 = setTimeout(() => setState("processing"), 5000);

      const t3 = setTimeout(() => {
        setState("success");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 7500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setState("idle");
      scale.setValue(0.85);
    }
  }, [visible]);

  const MPESA_GREEN = "#00A651";

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View
          style={[styles.sheet, { backgroundColor: colors.card, transform: [{ scale }] }]}
        >
          {/* M-Pesa header */}
          <View style={[styles.mpesaHeader, { backgroundColor: MPESA_GREEN }]}>
            <Text style={styles.mpesaLogo}>M-PESA</Text>
            <Text style={styles.mpesaTagline}>The easiest way to pay</Text>
          </View>

          {state === "sending" && (
            <View style={styles.body}>
              <View style={styles.dotsRow}>
                <Dot delay={0} />
                <Dot delay={200} />
                <Dot delay={400} />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground }]}>
                Sending STK Push
              </Text>
              <Text style={[styles.stateSub, { color: colors.mutedForeground }]}>
                Sending payment request to{"\n"}
                <Text style={{ color: MPESA_GREEN, fontFamily: "Inter_600SemiBold" }}>
                  {phone}
                </Text>
              </Text>
            </View>
          )}

          {state === "waiting" && (
            <View style={styles.body}>
              <View style={[styles.pinIconWrap, { backgroundColor: MPESA_GREEN + "18" }]}>
                <Feather name="smartphone" size={36} color={MPESA_GREEN} />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground }]}>
                Check Your Phone
              </Text>
              <Text style={[styles.stateSub, { color: colors.mutedForeground }]}>
                Enter your M-Pesa PIN on your phone to authorise payment of
              </Text>
              <View style={[styles.amountBadge, { backgroundColor: MPESA_GREEN + "14", borderColor: MPESA_GREEN + "40" }]}>
                <Text style={[styles.amountText, { color: MPESA_GREEN }]}>
                  KSh {amount.toLocaleString()}
                </Text>
              </View>
              <Text style={[styles.descText, { color: colors.mutedForeground }]}>
                {description}
              </Text>
              <View style={styles.dotsRow}>
                <Dot delay={0} />
                <Dot delay={300} />
                <Dot delay={600} />
              </View>
              <Text style={[styles.waitText, { color: colors.mutedForeground }]}>
                Waiting for PIN confirmation...
              </Text>
            </View>
          )}

          {state === "processing" && (
            <View style={styles.body}>
              <View style={styles.dotsRow}>
                <Dot delay={0} />
                <Dot delay={200} />
                <Dot delay={400} />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground }]}>
                Processing Payment
              </Text>
              <Text style={[styles.stateSub, { color: colors.mutedForeground }]}>
                Your payment is being processed securely...
              </Text>
            </View>
          )}

          {state === "success" && (
            <View style={styles.body}>
              <View style={[styles.successCircle, { backgroundColor: MPESA_GREEN }]}>
                <Feather name="check" size={36} color="#FFF" />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground }]}>
                Payment Successful!
              </Text>
              <Text style={[styles.stateSub, { color: colors.mutedForeground }]}>
                KSh {amount.toLocaleString()} paid to Drive It Kenya
              </Text>

              <View style={[styles.receiptCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ReceiptRow label="Amount" value={`KSh ${amount.toLocaleString()}`} colors={colors} />
                <ReceiptRow label="To" value="Drive It Kenya" colors={colors} />
                <ReceiptRow label="Phone" value={phone} colors={colors} />
                <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
                <ReceiptRow label="M-Pesa Ref" value={mpesaRef} colors={colors} highlight />
                <ReceiptRow label="Date" value={new Date().toLocaleString("en-KE")} colors={colors} />
              </View>

              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: MPESA_GREEN }]}
                onPress={() => onSuccess(mpesaRef)}
                activeOpacity={0.85}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {state === "failed" && (
            <View style={styles.body}>
              <View style={[styles.failCircle, { backgroundColor: colors.destructive }]}>
                <Feather name="x" size={36} color="#FFF" />
              </View>
              <Text style={[styles.stateTitle, { color: colors.foreground }]}>Payment Failed</Text>
              <Text style={[styles.stateSub, { color: colors.mutedForeground }]}>
                The transaction was cancelled or your M-Pesa PIN was incorrect.
              </Text>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.primary }]}
                onPress={onFailure}
                activeOpacity={0.85}
              >
                <Text style={styles.doneBtnText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

function ReceiptRow({
  label,
  value,
  colors,
  highlight,
}: {
  label: string;
  value: string;
  colors: any;
  highlight?: boolean;
}) {
  return (
    <View style={styles.receiptRow}>
      <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text
        style={[
          styles.receiptValue,
          {
            color: highlight ? "#00A651" : colors.foreground,
            fontFamily: highlight ? "Inter_700Bold" : "Inter_500Medium",
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    maxWidth: 380,
  },
  mpesaHeader: {
    paddingVertical: 18,
    alignItems: "center",
  },
  mpesaLogo: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 4,
  },
  mpesaTagline: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFFAA",
    marginTop: 2,
  },
  body: {
    padding: 24,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00A651",
  },
  stateTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  stateSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  pinIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  amountBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  amountText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  descText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  waitText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  failCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  receiptCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginVertical: 16,
    gap: 8,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  receiptValue: {
    fontSize: 13,
    maxWidth: "55%",
    textAlign: "right",
  },
  receiptDivider: {
    height: 1,
    marginVertical: 4,
  },
  doneBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
