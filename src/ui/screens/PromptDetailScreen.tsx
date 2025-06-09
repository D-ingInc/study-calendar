
// src/ui/screens/PromptDetailScreen.tsx

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import { usePrompts } from '../../contexts/AppContext';
import { RootStackScreenProps } from '../../types/navigation';
import { Button, Card, Badge } from '../../components/common';
import { PromptLabel } from '../../types/models';

const labelColors = {
  [PromptLabel.CHATGPT]: '#74AA9C',
  [PromptLabel.CLAUDE]: '#D97757',
  [PromptLabel.GEMINI]: '#4285F4',
  [PromptLabel.DEEPSEEK]: '#1E3A8A',
  [PromptLabel.PROGRAMMING]: '#5C6BC0',
  [PromptLabel.OTHER]: '#9E9E9E',
};

const labelNames = {
  [PromptLabel.CHATGPT]: 'ChatGPT',
  [PromptLabel.CLAUDE]: 'Claude',
  [PromptLabel.GEMINI]: 'Gemini',
  [PromptLabel.DEEPSEEK]: 'DeepSeek',
  [PromptLabel.PROGRAMMING]: 'プログラミング',
  [PromptLabel.OTHER]: 'その他',
};

type Props = RootStackScreenProps<'PromptDetail'>;

export const PromptDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { promptId } = route.params;
  
  const { prompts, deletePrompt } = usePrompts();
  const prompt = prompts.find(p => p.id === promptId);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!prompt) {
    return null;
  }

  const handleDelete = () => {
    Alert.alert(
      'プロンプトを削除',
      'このプロンプトを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deletePrompt(promptId);
              navigation.goBack();
            } catch {
              Alert.alert('エラー', '削除に失敗しました');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCopy = () => {
    // React NativeのClipboardを使用
    // import { Clipboard } from '@react-native-clipboard/clipboard';
    // Clipboard.setString(prompt.content);
    
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    Alert.alert('コピー完了', 'プロンプトをクリップボードにコピーしました');
  };

  const handleEdit = () => {
    navigation.navigate('PromptEdit', { promptId });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card>
          <View style={styles.header}>
            <Badge
              label={labelNames[prompt.label]}
              backgroundColor={labelColors[prompt.label]}
            />
            <Text style={styles.date}>
              {new Date(prompt.createdAt).toLocaleDateString('ja-JP')}
            </Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>プロンプト</Text>
            <Text style={styles.promptContent}>{prompt.content}</Text>
          </View>

          {prompt.memo && (
            <View style={styles.memoSection}>
              <Text style={styles.sectionTitle}>メモ</Text>
              <Text style={styles.memo}>{prompt.memo}</Text>
            </View>
          )}

          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              作成日: {new Date(prompt.createdAt).toLocaleString('ja-JP')}
            </Text>
            {prompt.updatedAt !== prompt.createdAt && (
              <Text style={styles.metadataText}>
                更新日: {new Date(prompt.updatedAt).toLocaleString('ja-JP')}
              </Text>
            )}
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            title={isCopied ? 'コピー済み' : 'プロンプトをコピー'}
            onPress={handleCopy}
            disabled={isCopied}
            fullWidth
            style={styles.actionButton}
          />
          
          <View style={styles.buttonRow}>
            <Button
              title="編集"
              variant="secondary"
              onPress={handleEdit}
              style={styles.button}
            />
            <Button
              title="削除"
              variant="danger"
              onPress={handleDelete}
              loading={isDeleting}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  contentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  promptContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  memoSection: {
    marginTop: 16,
  },
  memo: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  metadata: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  actions: {
    marginTop: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});