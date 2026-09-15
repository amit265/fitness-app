import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Typography } from './Typography';
import { PALETTE } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';

interface MarkdownTextProps {
  text: string;
  isCoach: boolean;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ text, isCoach }) => {
  const router = useRouter();
  const { colors } = useAppTheme();
  // Strip any raw HTML tags and replace <br> tags with clean newlines
  const sanitizedText = (text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '');

  const lines = sanitizedText.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const isHeading = trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ');
        
        let contentText = line;
        let variant: 'bodyMedium' | 'h3' = 'bodyMedium';
        let bulletPrefix = '';

        if (isBullet) {
          bulletPrefix = '•  ';
          contentText = trimmed.substring(2);
        } else if (isHeading) {
          variant = 'h3';
          if (trimmed.startsWith('### ')) contentText = trimmed.substring(4);
          else if (trimmed.startsWith('## ')) contentText = trimmed.substring(3);
          else contentText = trimmed.substring(2);
        }

        // Parse bold markers (**bold**) and links ([text](url))
        const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g;
        const parts = contentText.split(regex);
        
        // If the line is empty and it's not a bullet/heading, render a spacer line
        if (trimmed.length === 0) {
          return <View key={lineIdx} style={styles.spacer} />;
        }

        return (
          <Typography
            key={lineIdx}
            variant={variant}
            color={isCoach ? undefined : PALETTE.white}
            style={styles.lineText}
          >
            {bulletPrefix}
            {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={idx} style={{ fontFamily: 'Urbanist-Bold' }}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                  return (
                    <Text 
                      key={idx} 
                      style={{ color: colors.primary, textDecorationLine: 'underline' }}
                      onPress={() => router.push(linkMatch[2] as any)}
                    >
                      {linkMatch[1]}
                    </Text>
                  );
                }
              }
              return <Text key={idx}>{part}</Text>;
            })}
          </Typography>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  lineText: {
    lineHeight: 20,
    marginVertical: 2,
  },
  spacer: {
    height: 8,
  },
});
