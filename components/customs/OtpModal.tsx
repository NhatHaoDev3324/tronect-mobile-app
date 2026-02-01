import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = {
  open: boolean;
  email: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void> | void;
  onResend?: () => Promise<void> | void;
};

export function OtpModal({
  open,
  loading = false,
  email,
  onClose,
  onSubmit,
  onResend,
}: Props) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 minutes
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const code = useMemo(() => digits.join(""), [digits]);
  const isComplete = code.length === 6 && digits.every((d) => d !== "");

  useEffect(() => {
    if (open) {
      setDigits(Array(6).fill(""));
      setSecondsRemaining(300);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      timerRef.current = setInterval(() => {
        setSecondsRemaining((s) => {
          if (s <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);

      setTimeout(() => inputsRef.current[0]?.focus(), 150);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open]);

  const setDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1); // chỉ 1 số
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });

    if (v && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === "Backspace") {
      // nếu ô hiện tại rỗng thì lùi về ô trước
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    }
  };

  const handlePasteOrAutoFill = (text: string) => {
    const only = text.replace(/\D/g, "").slice(0, 6);
    if (only.length <= 1) return;
    const arr = only.split("");
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < 6; i++) next[i] = arr[i] ?? "";
      return next;
    });
    const focusIndex = Math.min(only.length, 5);
    setTimeout(() => inputsRef.current[focusIndex]?.focus(), 50);
  };

  const submit = async () => {
    if (secondsRemaining === 0) {
      Toast.show({ type: "error", text1: "OTP đã hết hạn", text2: "Vui lòng gửi lại OTP." });
      return;
    }
    if (!isComplete) {
      Toast.show({
        type: "error",
        text1: "Thiếu OTP",
        text2: "Vui lòng nhập đủ 6 số OTP.",
      });
      return;
    }
    await onSubmit(code);
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/40 justify-center px-5"
      >
        <Pressable
          onPress={() => { }}
          className="bg-background rounded-2xl p-5 relative"
        >
          {/* Nút X đóng modal */}
          <Pressable
            onPress={onClose}
            hitSlop={10}
            className="absolute top-4 right-4"
          >
            <Text className="text-xl text-foreground"><X /></Text>
          </Pressable>

          <Text className="text-lg font-extrabold">Xác nhận OTP</Text>
          <Text className="text-muted-foreground mt-1">
            Nhập mã OTP gồm 6 chữ số đã gửi qua email của bạn.
          </Text>

          {/* OTP boxes */}
          <View className="flex-row justify-between mt-4">
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => { inputsRef.current[i] = r; }}
                value={d}
                onChangeText={(t) => {
                  // nếu paste/auto-fill cả chuỗi
                  if (t.length > 1) {
                    handlePasteOrAutoFill(t);
                    return;
                  }
                  setDigit(i, t);
                }}
                onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={1}
                textAlign="center"
                className="w-12 h-12 rounded-xl border border-border text-base text-foreground"
              />
            ))}
          </View>

          <Text className="text-sm text-center text-muted-foreground mt-3">
            {secondsRemaining > 0
              ? `Thời gian còn lại: ${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:${String(
                secondsRemaining % 60
              ).padStart(2, "0")}`
              : "OTP đã hết hạn"}
          </Text>

          <View className="mt-5 gap-3">
            <Button
              variant={"tronect"}
              disabled={loading || secondsRemaining === 0}
              onPress={submit}
              className="w-full"
            >
              {loading ? <ActivityIndicator /> : <Text className="font-extrabold">Xác nhận</Text>}
            </Button>

            <Button
              variant={"outline"}
              className="w-full"
              disabled={loading || !onResend}
              onPress={async () => {
                if (!onResend) return;
                // Delegate resend logic to parent (parent will close modal and show loading)
                await onResend();
              }}
            >
              <Text className="font-extrabold">Gửi lại OTP</Text>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
