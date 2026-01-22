import { ActivityIndicator, Text, View } from "react-native";

export const LoadingData = () => {
    return (
        <View style={{ width: "100%", height: "100%" }} className="items-center justify-center bg-background">
            <ActivityIndicator size="large" color="#2baf90" />
            <Text className="mt-3 text-muted-foreground">
                Đang tải dữ liệu...
            </Text>
        </View>
    );
};