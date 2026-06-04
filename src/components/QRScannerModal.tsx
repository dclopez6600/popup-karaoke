// ─────────────────────────────────────────────
//  QRScannerModal — Scan venue QR codes to open
//  the KaraFun queue without typing a URL.
// ─────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Linking, Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ visible, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedUrl, setScannedUrl] = useState('');

  useEffect(() => {
    if (visible) setScanned(false);
  }, [visible]);

  const handleBarCode = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScannedUrl(data);
  };

  const openUrl = () => {
    Linking.openURL(scannedUrl);
    onClose();
    setScanned(false);
  };

  const rescan = () => { setScanned(false); setScannedUrl(''); };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={styles.center}>
          <Text style={styles.permText}>Checking camera permission…</Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={56} color={Colors.primary} style={{ marginBottom: 20 }} />
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <Text style={styles.permText}>We need camera access to scan QR codes at venues.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📷 Scan QR Code</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {scanned && scannedUrl ? (
          // ── Result ──────────────────────────────
          <View style={styles.resultWrap}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            <Text style={styles.resultTitle}>QR Code Scanned!</Text>
            <Text style={styles.resultUrl} numberOfLines={2}>{scannedUrl}</Text>
            <TouchableOpacity style={styles.openBtn} onPress={openUrl} activeOpacity={0.85}>
              <Text style={styles.openBtnText}>🎵 Open Queue →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rescanBtn} onPress={rescan} activeOpacity={0.8}>
              <Text style={styles.rescanBtnText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ── Camera ──────────────────────────────
          <View style={styles.cameraWrap}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarCode}
            />
            {/* Viewfinder overlay */}
            <View style={styles.overlay}>
              <View style={styles.viewfinder}>
                {/* Corner marks */}
                {[
                  { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
                  { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
                  { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
                  { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
                ].map((s, i) => (
                  <View key={i} style={[styles.corner, s]} />
                ))}
              </View>
              <Text style={styles.hint}>Point at a QR code at the venue</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const CAM_SIZE = width * 0.7;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#222', backgroundColor: '#111' },
  headerTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

  cameraWrap: { flex: 1, position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 24 },
  viewfinder: { width: CAM_SIZE, height: CAM_SIZE, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: Colors.primary },

  hint: { color: '#fff', fontSize: FontSize.sm, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.pill },

  resultWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 16, backgroundColor: Colors.bg },
  resultTitle: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  resultUrl: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center' },
  openBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center' },
  openBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  rescanBtn: { paddingVertical: 10 },
  rescanBtnText: { color: Colors.textMuted, fontSize: FontSize.sm },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 16, backgroundColor: Colors.bg },
  permTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
  permText: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  permBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 14, paddingHorizontal: 32 },
  permBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  cancelLink: { paddingVertical: 8 },
  cancelLinkText: { color: Colors.textMuted, fontSize: FontSize.sm },
});
