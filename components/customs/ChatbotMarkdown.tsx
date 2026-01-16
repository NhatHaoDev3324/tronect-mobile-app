import { Linking } from 'react-native';
import Markdown from 'react-native-markdown-display';

type Props = {
  content: string;
  variant?: 'assistant' | 'user';
};

export function ChatbotMarkdown({ content, variant = 'assistant' }: Props) {
  const isUser = variant === 'user';

  const textColor = isUser ? '#ffffff' : '#111827';
  const mutedColor = isUser ? 'rgba(255,255,255,0.85)' : '#6b7280';
  const primary = '#2baf90';

  return (
    <Markdown
      style={{
        body: {
          fontSize: 14,
          lineHeight: 20,
          color: textColor,
        },

        paragraph: {
          marginTop: 0,
          marginBottom: 0,
          color: mutedColor,

        },

        strong: {
          fontWeight: '600',
          color: textColor,
        },

        em: {
          fontStyle: 'italic',
          color: mutedColor,
        },

        heading1: {
          backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          fontSize: 16,
          fontWeight: '700',
          alignSelf: 'flex-start',
          marginVertical: 8,
        },
        heading2: {
          backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          fontSize: 15,
          fontWeight: '700',
          alignSelf: 'flex-start',
          marginVertical: 8,
        },

        bullet_list: {
          marginVertical: 6,
        },
        list_item: {
          flexDirection: 'row',
          marginVertical: 4,
        },
        bullet_list_icon: {
          color: isUser ? '#ffffff' : primary,
        },

        blockquote: {
          backgroundColor: isUser
            ? 'rgba(255,255,255,0.12)'
            : '#f9fafb',
          borderLeftWidth: 3,
          borderLeftColor: primary,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          marginVertical: 8,
        },

        link: {
          color: primary,
          textDecorationLine: 'none',
          backgroundColor: isUser
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(43,175,144,0.12)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          overflow: 'hidden',
        },

        code_inline: {
          backgroundColor: isUser
            ? 'rgba(255,255,255,0.15)'
            : '#f3f4f6',
          borderRadius: 6,
          paddingHorizontal: 6,
          paddingVertical: 2,
          fontSize: 12,
          fontFamily: 'monospace',
        },

        code_block: {
          backgroundColor: isUser
            ? 'rgba(255,255,255,0.08)'
            : '#f3f4f6',
          borderRadius: 12,
          padding: 12,
          fontSize: 12,
          fontFamily: 'monospace',
          marginVertical: 8,
        },

        hr: {
          backgroundColor: isUser
            ? 'rgba(255,255,255,0.2)'
            : '#e5e7eb',
          height: 1,
          marginVertical: 12,
        },
      }}
      onLinkPress={(url) => {
        Linking.openURL(url);
        return false;
      }}
    >
      {content}
    </Markdown>
  );
}
