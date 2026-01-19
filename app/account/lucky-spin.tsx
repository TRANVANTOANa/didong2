import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, increment, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop as SvgStop, Text as SvgText } from "react-native-svg";
import { auth, db } from "../../firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");

// Rewards - 12 segments for more variety
const rewards = [
  { label: "10% OFF", color: "#6366F1", code: "SALE10" },
  { label: "Try Again", color: "#475569", code: null },
  { label: "Free Ship", color: "#10B981", code: "FREESHIP" },
  { label: "15% OFF", color: "#3B82F6", code: "WELCOME15" },
  { label: "So Close!", color: "#64748B", code: null },
  { label: "$100 OFF", color: "#EC4899", code: "VIP100" },
  { label: "20% OFF", color: "#F59E0B", code: "FLASH20" },
  { label: "Good Luck", color: "#475569", code: null },
  { label: "25% OFF", color: "#8B5CF6", code: "MEMBER25" },
  { label: "Birthday", color: "#EF4444", code: "BIRTHDAY" },
  { label: "Try Again", color: "#64748B", code: null },
  { label: "30% OFF", color: "#14B8A6", code: "SUPER30" },
];

// Wheel Geometry - Fixed for all screen sizes
const WHEEL_SIZE = Math.min(width * 0.85, 320);
const OUTER_RIM = 10;
const INNER_RADIUS = Math.max((WHEEL_SIZE / 2) - OUTER_RIM, 50);
const CENTER_RADIUS = 28;
const ANGLE = 360 / rewards.length;

export default function LuckySpinScreen() {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; color: string; code: string | null } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "savedVouchers"),
        where("source", "==", "lucky_spin")
      );
      const snapshot = await getDocs(q);
      const historyList: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        historyList.push({
          id: docSnap.id,
          ...data,
          savedAt: data.savedAt?.toDate(),
        });
      });
      historyList.sort((a, b) => (b.savedAt?.getTime() || 0) - (a.savedAt?.getTime() || 0));
      setHistory(historyList);
    } catch (error) {
      console.error("Error fetching spin history:", error);
    }
  };

  const saveWonVoucher = async (voucherCode: string) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const q = query(collection(db, "vouchers"), where("code", "==", voucherCode));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.warn(`Voucher with code '${voucherCode}' not found.`);
        return;
      }
      const voucherDoc = querySnapshot.docs[0];
      const voucherId = voucherDoc.id;
      const savedRef = doc(db, "users", user.uid, "savedVouchers", voucherId);
      const savedDocSnapshot = await getDoc(savedRef);

      if (savedDocSnapshot.exists()) {
        // Voucher already exists - increment quantity
        await updateDoc(savedRef, {
          quantity: increment(1),
          lastWonAt: Timestamp.now(),
        });
        console.log(`Voucher ${voucherCode} quantity increased for user ${user.uid}`);
      } else {
        // New voucher - create with quantity 1
        await setDoc(savedRef, {
          voucherId: voucherId,
          savedAt: Timestamp.now(),
          source: "lucky_spin",
          code: voucherCode,
          label: rewards.find(r => r.code === voucherCode)?.label || "Voucher",
          quantity: 1,
        });
        console.log(`Voucher ${voucherCode} saved to user ${user.uid}`);
      }
    } catch (error) {
      console.error("Error saving won voucher:", error);
    }
  };

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);

    const randomIndex = Math.floor(Math.random() * rewards.length);
    const selectedReward = rewards[randomIndex];
    const segmentAngle = 360 / rewards.length;
    const currentCenterAngle = randomIndex * segmentAngle + segmentAngle / 2;
    let rotationNeeded = 270 - currentCenterAngle;
    const spinCount = 7;
    const finalValue = 360 * spinCount + rotationNeeded;

    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: finalValue,
      duration: 4500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setResult(selectedReward);
      setShowModal(true);
      if (selectedReward.code) {
        saveWonVoucher(selectedReward.code);
      }
    });
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const renderWheel = () => {
    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;

    return (
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
        <Defs>
          <LinearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <SvgStop offset="0%" stopColor="#FFD700" />
            <SvgStop offset="50%" stopColor="#FFA500" />
            <SvgStop offset="100%" stopColor="#FFD700" />
          </LinearGradient>
        </Defs>

        {/* Outer Gold Rim */}
        <Circle cx={cx} cy={cy} r={Math.max(WHEEL_SIZE / 2 - 2, 10)} fill="url(#goldRim)" />
        <Circle cx={cx} cy={cy} r={Math.max(WHEEL_SIZE / 2 - OUTER_RIM, 10)} fill="#1E293B" />

        {/* Rim Lights */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i * 360) / 20;
          const rad = (angle * Math.PI) / 180;
          const lightR = WHEEL_SIZE / 2 - OUTER_RIM / 2;
          const lx = cx + lightR * Math.cos(rad);
          const ly = cy + lightR * Math.sin(rad);
          return (
            <Circle
              key={i}
              cx={lx}
              cy={ly}
              r={4}
              fill={i % 2 === 0 ? "#FBBF24" : "#FFFFFF"}
            />
          );
        })}

        {/* Wheel Segments */}
        <G>
          {rewards.map((item, index) => {
            const startAngle = index * ANGLE - 90; // Start from top
            const endAngle = (index + 1) * ANGLE - 90;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = cx + INNER_RADIUS * Math.cos(startRad);
            const y1 = cy + INNER_RADIUS * Math.sin(startRad);
            const x2 = cx + INNER_RADIUS * Math.cos(endRad);
            const y2 = cy + INNER_RADIUS * Math.sin(endRad);

            const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 1 ${x2} ${y2} Z`;

            // Text position
            const midAngle = ((startAngle + endAngle) / 2) * Math.PI / 180;
            const textR = INNER_RADIUS * 0.65;
            const tx = cx + textR * Math.cos(midAngle);
            const ty = cy + textR * Math.sin(midAngle);
            const textRotation = (startAngle + endAngle) / 2 + 90;

            return (
              <G key={index}>
                <Path d={pathData} fill={item.color} stroke="#0F172A" strokeWidth="1" />
                <SvgText
                  x={tx}
                  y={ty}
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                >
                  {item.label}
                </SvgText>
              </G>
            );
          })}
        </G>

        {/* Center Hub */}
        <Circle cx={cx} cy={cy} r={CENTER_RADIUS + 5} fill="#FFD700" />
        <Circle cx={cx} cy={cy} r={CENTER_RADIUS} fill="#1E293B" />
        <SvgText x={cx} y={cy + 4} fontSize="18" fill="#FFD700" textAnchor="middle" fontWeight="bold">
          ★
        </SvgText>
      </Svg>
    );
  };

  const handleClaim = () => {
    setShowModal(false);
    const user = auth.currentUser;
    if (!user && result?.code) {
      Alert.alert("Login Required", "Please login to claim.", [{ text: "OK" }]);
      return;
    }
    if (result?.code) {
      router.push({ pathname: "/account/vouchers", params: { tab: "saved" } });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Background */}
      <View style={styles.gradientBg}>
        {/* Decorative circles */}
        <View style={[styles.decorCircle, { top: -50, left: -50, backgroundColor: 'rgba(99,102,241,0.3)' }]} />
        <View style={[styles.decorCircle, { top: 100, right: -80, backgroundColor: 'rgba(236,72,153,0.2)' }]} />
        <View style={[styles.decorCircle, { bottom: 50, left: -60, backgroundColor: 'rgba(245,158,11,0.2)' }]} />

        {/* Stars/Sparkles */}
        {[...Array(12)].map((_, i) => (
          <Text
            key={i}
            style={[
              styles.sparkle,
              {
                top: Math.random() * height * 0.6,
                left: Math.random() * width,
                fontSize: 10 + Math.random() * 10,
                opacity: 0.3 + Math.random() * 0.5,
              },
            ]}
          >
            ✦
          </Text>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LUCKY SPIN</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => { fetchHistory(); setShowHistory(true); }}>
          <Ionicons name="time-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleBox}>
          <Text style={styles.subtitle}>🎁 EXCLUSIVE REWARDS</Text>
          <Text style={styles.title}>SPIN TO WIN</Text>
        </View>

        {/* Wheel Container */}
        <View style={styles.wheelWrapper}>
          {/* Pointer */}
          <View style={styles.pointerWrapper}>
            <View style={styles.pointer} />
          </View>

          {/* Wheel */}
          <Animated.View style={[styles.wheelBox, { transform: [{ rotate }] }]}>
            {renderWheel()}
          </Animated.View>

          {/* Glow effect */}
          <View style={styles.wheelGlow} />
        </View>

        {/* Spin Button */}
        <TouchableOpacity
          style={[styles.spinBtn, spinning && styles.spinBtnDisabled]}
          onPress={spinWheel}
          disabled={spinning}
          activeOpacity={0.85}
        >
          <View style={styles.spinBtnInner}>
            <Text style={styles.spinBtnText}>
              {spinning ? "🎰 SPINNING..." : "🎯 SPIN NOW"}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.hint}>Tap the button to try your luck!</Text>
      </View>

      {/* Result Modal */}
      <Modal transparent visible={showModal} animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={[styles.modalIcon, { backgroundColor: result?.code ? "#10B981" : "#EF4444" }]}>
              <Ionicons name={result?.code ? "gift" : "close"} size={36} color="#FFF" />
            </View>
            <Text style={styles.modalTitle}>{result?.code ? "🎉 YOU WON!" : "😢 Not This Time"}</Text>
            <Text style={styles.modalMsg}>
              {result?.code ? `Congratulations!\nYou got ${result.label}` : "Better luck next time!"}
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleClaim}>
              <Text style={styles.modalBtnText}>{result?.code ? "CLAIM NOW" : "TRY AGAIN"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal animationType="slide" transparent visible={showHistory} onRequestClose={() => setShowHistory(false)}>
        <View style={styles.historyOverlay}>
          <View style={styles.historyBox}>
            <View style={styles.historyHead}>
              <Text style={styles.historyTitle}>🏆 Your Wins</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyRow}>
                  <View style={styles.historyBadge}>
                    <Ionicons name="gift" size={18} color="#6366F1" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyLabel}>{item.label || item.code}</Text>
                    <Text style={styles.historyDate}>{item.savedAt?.toLocaleDateString() || ""}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyHistory}>
                  <Ionicons name="trophy-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No wins yet</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1E293B",
    overflow: "hidden",
  },
  decorCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  sparkle: {
    position: "absolute",
    color: "#FFD700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 16,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  titleBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 12,
    color: "#FBBF24",
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  wheelWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  wheelBox: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
  },
  wheelGlow: {
    position: "absolute",
    width: WHEEL_SIZE + 40,
    height: WHEEL_SIZE + 40,
    borderRadius: (WHEEL_SIZE + 40) / 2,
    backgroundColor: "rgba(251,191,36,0.15)",
    zIndex: -1,
  },
  pointerWrapper: {
    position: "absolute",
    top: -10,
    zIndex: 100,
    alignItems: "center",
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 28,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#EF4444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  spinBtn: {
    marginTop: 20,
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  spinBtnDisabled: {
    opacity: 0.6,
  },
  spinBtnInner: {
    backgroundColor: "#6366F1",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 50,
  },
  spinBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  hint: {
    marginTop: 16,
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 30,
    alignItems: "center",
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -60,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  modalMsg: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 50,
    width: "100%",
    alignItems: "center",
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // History Modal
  historyOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  historyBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "70%",
    padding: 24,
  },
  historyHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 16,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  historyBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  historyDate: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
  },
  emptyHistory: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#94A3B8",
  },
});
