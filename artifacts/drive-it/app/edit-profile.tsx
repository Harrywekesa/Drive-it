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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useApp();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber ?? "");
  const [licenseType, setLicenseType] = useState(user?.licenseType ?? "");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Validation", "Phone number is required.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    await updateUser({
      ...user!,
      name: name.trim(),
      phone: phone.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseType: licenseType.trim(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveText, { color: colors.primary, opacity: saving ? 0.5 : 1 }]}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase() || "D"}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PERSONAL INFORMATION</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InputField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            icon="user"
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InputField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+254 7XX XXX XXX"
            icon="phone"
            keyboardType="phone-pad"
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LICENSE INFORMATION</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InputField
            label="License Number"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="DL-XXXX-NBI-XXXXX"
            icon="credit-card"
            autoCapitalize="characters"
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InputField
            label="License Class"
            value={licenseType}
            onChangeText={setLicenseType}
            placeholder="e.g. Class B (Light Motor Vehicle)"
            icon="award"
            colors={colors}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType,
  autoCapitalize,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  icon: string;
  keyboardType?: any;
  autoCapitalize?: any;
  colors: any;
}) {
  return (
    <View style={styles.fieldRow}>
      <View style={[styles.fieldIconWrap, { backgroundColor: colors.primary + "18" }]}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={styles.fieldText}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <TextInput
          style={[styles.fieldInput, { color: colors.foreground }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "words"}
        />
      </View>
    </View>
  );
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  saveText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 28 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#FFF" },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
  },
  fieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldText: { flex: 1 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 3 },
  fieldInput: { fontSize: 15, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginLeft: 64 },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
