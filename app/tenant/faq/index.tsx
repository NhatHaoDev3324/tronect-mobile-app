import { useEffect, useState } from "react";
import {
    Pressable,
    ScrollView,
    View,
    type ViewProps
} from "react-native";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { getLandlordFaq, getTenantFaq } from "@/api/FAQApi";
import { ThemedView } from "@/components/themed-view";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { FAQType } from "@/types/faqType";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function FAQScreen({
    lightColor,
    darkColor,
}: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );
    const { role } = useAuthStore();
    const [roomTab, setRoomTab] = useState<"tenant" | "landlord">("tenant");
    const [tenantfaqs, setTenantFaqs] = useState<FAQType[]>([]);
    const [landlordfaqs, setLandlordFaqs] = useState<FAQType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tenantRes = await getTenantFaq();
                setTenantFaqs(tenantRes);
                const landlordRes = await getLandlordFaq();
                setLandlordFaqs(landlordRes);
            } catch (err) {
                console.error(err);
            }
        };
        void fetchData();
    }, []);

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor }}
            contentContainerStyle={{ paddingBottom: 32 }}
        >

            <ThemedView className="mt-8 mb-4 px-4">
                <Text className="text-xl font-bold text-foreground">
                    Câu hỏi thường gặp
                </Text>
                <Text className="text-sm text-muted-foreground mt-2">
                    Những thắc mắc phổ biến giúp bạn sử dụng Tronect hiệu quả hơn.
                </Text>
            </ThemedView>


            {role === "landlord" && (
                <View className="flex-row mb-2 px-4">
                    <Pressable onPress={() => setRoomTab("tenant")} className="mr-6 pb-2">
                        <Text className={cn("text-sm font-semibold", roomTab === "tenant" ? "text-[#FF6B35]" : "text-gray-400")}>
                            Người thuê
                        </Text>
                        {roomTab === "tenant" && (
                            <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
                        )}
                    </Pressable>
                    <Pressable onPress={() => setRoomTab("landlord")} className="pb-2">
                        <Text className={cn("text-sm font-semibold", roomTab === "landlord" ? "text-[#FF6B35]" : "text-gray-400")}>
                            Chủ trọ
                        </Text>
                        {roomTab === "landlord" && (
                            <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
                        )}
                    </Pressable>
                </View>
            )}

            {roomTab === "tenant" && (
                <ThemedView className="px-4">
                    <Accordion type="single" collapsible className="w-full">
                        {tenantfaqs.map((faq, index) => (
                            <AccordionItem
                                key={faq.id}
                                value={`faq-${faq.id}`}
                                className="mb-2 rounded-xl bg-transparent overflow-hidden"
                            >
                                <AccordionTrigger className="px-4 py-4">
                                    <Text className="text-base font-medium text-foreground">
                                        {index + 1}. {faq.question}
                                    </Text>
                                </AccordionTrigger>

                                <AccordionContent className="px-4 pb-4">
                                    <Text className="text-sm text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </Text>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ThemedView>
            )}

            {roomTab === "landlord" && (
                <ThemedView className="px-4">
                    <Accordion type="single" collapsible className="w-full">
                        {landlordfaqs.map((faq, index) => (
                            <AccordionItem
                                key={faq.id}
                                value={`faq-${faq.id}`}
                                className="mb-2 rounded-xl bg-background overflow-hidden"
                            >
                                <AccordionTrigger className="px-4 py-4">
                                    <Text className="text-base font-medium text-foreground">
                                        {index + 1}. {faq.question}
                                    </Text>
                                </AccordionTrigger>

                                <AccordionContent className="px-4 pb-4">
                                    <Text className="text-sm text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </Text>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ThemedView>
            )}


        </ScrollView>
    );
}