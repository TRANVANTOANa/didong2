// app/(auth)/otp.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const OTP_LENGTH = 6;
const HARD_CODE_OTP = "123456";

export default function OTPScreen() {
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [countdown, setCountdown] = useState(60);

  // Khởi tạo mảng ref đúng kích thước 6 phần tử
  const inputs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  // Auto focus ô đầu tiên khi vào màn hình
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // Countdown 60s
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Tự động kiểm tra khi đủ 6 số
  useEffect(() => {
    if (otp.join("").length === OTP_LENGTH) {
      if (otp.join("") === HARD_CODE_OTP) {
        setTimeout(() => {
          Alert.alert("Thành công!", "Xác thực OTP thành công!", [
            { text: "OK", onPress: () => router.push("/(main)") },
          ]);
        }, 500);
      } else {
        Alert.alert("Sai mã OTP", "Mã đúng là 123456", [{ text: "OK" }]);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputs.current[0]?.focus();
      }
    }
  }, [otp, router]);

  const handleChange = (text: string, index: number) => {
    // Chỉ cho phép số và xóa
    if (text && !/^\d$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Tự động nhảy ô
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (text && index === OTP_LENGTH - 1) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = ({ nativeEvent }: any, index: number) => {
    if (nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const resendOTP = () => {
    setCountdown(60);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputs.current[0]?.focus();
    Alert.alert("Đã gửi lại!", "Mã OTP mới: 123456");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập mã xác minh</Text>
      <Text style={styles.subtitle}>Mã đã được gửi đến email của bạn</Text>
      <Text style={styles.hardcodeHint}>
        Dùng mã: <Text style={styles.boldBlue}>123456</Text>
      </Text>

      {/* 6 ô OTP */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.box,
              focusedIndex === index && styles.boxFocused,
              digit ? styles.boxFilled : null,
            ]}
          >
            <TextInput
              ref={(ref) => {
                inputs.current[index] = ref; // ← Không lỗi TypeScript nữa!
              }}
              style={styles.input}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
            />

            {/* Dấu chấm tròn khi chưa nhập */}
            {!digit && focusedIndex !== index && <View style={styles.dot} />}
          </View>
        ))}
      </View>

      {/* Resend OTP */}
      <View style={styles.resendWrapper}>
        {countdown > 0 ? (
          <Text style={styles.timerText}>
            Gửi lại mã sau <Text style={styles.timerBold}>{countdown}s</Text>
          </Text>
        ) : (
          <TouchableOpacity onPress={resendOTP}>
            <Text style={styles.resendText}>Gửi lại mã OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nút Verify (tự động hiện khi đủ 6 số) */}
      {otp.join("").length === OTP_LENGTH && (
        <TouchableOpacity style={styles.verifyBtn}>
          <Text style={styles.verifyText}>Xác nhận & Tiếp tục</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 90,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A2530",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#778899",
    textAlign: "center",
    marginBottom: 12,
  },
  hardcodeHint: {
    fontSize: 17,
    color: "#444",
    marginBottom: 50,
  },
  boldBlue: {
    fontWeight: "bold",
    color: "#5B9EE1",
    fontSize: 18,
  },
  otpContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 60,
  },
  box: {
    width: 58,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8EAED",
    backgroundColor: "#F7F8FA",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  boxFocused: {
    borderColor: "#5B9EE1",
    backgroundColor: "#fff",
    shadowColor: "#5B9EE1",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  boxFilled: {
    borderColor: "#5B9EE1",
  },
  input: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A2530",
    width: "100%",
    height: "100%",
    textAlign: "center",
    padding: 0,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ccc",
    position: "absolute",
  },
  resendWrapper: {
    marginTop: 10,
  },
  timerText: {
    fontSize: 15,
    color: "#888",
  },
  timerBold: {
    fontWeight: "bold",
    color: "#5B9EE1",
  },
  resendText: {
    fontSize: 16,
    color: "#5B9EE1",
    fontWeight: "600",
  },
  verifyBtn: {
    marginTop: 60,
    backgroundColor: "#5B9EE1",
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: "#5B9EE1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  verifyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});