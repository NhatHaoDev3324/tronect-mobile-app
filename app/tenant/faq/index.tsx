import { useEffect, useState } from "react";
import {
  ScrollView,
  type ViewProps
} from "react-native";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { getTenantFaq } from "@/api/FAQApi";
import { ThemedView } from "@/components/themed-view";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
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

  const [faqs, setFaqs] = useState<FAQType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTenantFaq();
        setFaqs(res);
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

      <ThemedView className="px-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
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
    </ScrollView>
  );
}