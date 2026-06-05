// ─────────────────────────────────────────────
//  QRScannerModal — Coming soon (camera removed
//  for SDK 55 compatibility; re-add expo-camera
//  once a compatible version ships)
// ─────────────────────────────────────────────

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ visible, onClose }: Props) {
  if (!visible) return null;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📷 QR Scanner</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Ionicons name="qr-code-outline" size={72} color={Colors.primary} />
          <Text style={styles.title}>QR Scanner</Text>
          <Text style={styles.sub}>
            QR code scanning will be available in the next update.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg },
  title: { fontSize: FontSize.xxl, color: Colors.textPrimary, fontWeight: FontWeight.bold },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  btnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
