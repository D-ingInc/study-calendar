// src/ui/screens/PromptEditScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { usePrompts } from '../../contexts/AppContext';
import { Input, Button, Card, ModalPicker } from '../../components/common';
import { Prompt, PromptLabel } from '../../types/models';
import { RootStackScreenProps } from '../../types/navigation';

const labelOptions = [
  { label: 'ChatGPT', value: PromptLabel.CHATGPT },
  { label: 'Claude', value: PromptLabel.CLAUDE },
  { label: 'Gemini', value: PromptLabel.GEMINI },
  { label: 'DeepSeek', value: PromptLabel.DEEPSEEK },
  { label: 'プログラミング', value: PromptLabel.PROGRAMMING },
  { label: 'その他', value: PromptLabel.OTHER },
];

type Props = RootStackScreenProps<'PromptEdit'>;

export const PromptEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { prompts, updatePrompt } = usePrompts();
  const { promptId } = route.params;

  const [content, setContent] = useState('');
  const [label, setLabel] = useState(PromptLabel.CHATGPT);
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const prompt = prompts.find(p => p.id === promptId);

  useEffect(() => {
    if (prompt) {
      setContent(prompt.content);
      setLabel(prompt.label);
      setMemo(prompt.memo || '');
    }
  }, [prompt]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('エラー', 'プロンプトを入力してください');
      return;
    }

    if (!prompt) {
      Alert.alert('エラー', 'プロンプトが見つかりません');
      return;
    }

    setIsLoading(true);
    try {
      const updatedPrompt: Partial<Prompt> = {
        content: content.trim(),
        label,
        memo: memo.trim() || undefined,
      };

      await updatePrompt(promptId, updatedPrompt);
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs', { screen: 'Prompts' });
      }
    } catch {
      Alert.alert('エラー', 'プロンプトの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!prompt) {
    return (
      <View style={styles.container}>
        <Card>
          <Input
            label="エラー"
            value="プロンプトが見つかりません"
            editable={false}
          />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card>
          <Input
            label="プロンプト"
            value={content}
            onChangeText={setContent}
            placeholder="使用したプロンプトを入力"
            multiline
            numberOfLines={6}
          />

          <ModalPicker
            label="ラベル"
            selectedValue={label}
            onValueChange={setLabel}
            options={labelOptions}
          />

          <Input
            label="メモ（任意）"
            value={memo}
            onChangeText={setMemo}
            placeholder="このプロンプトについてのメモ"
            multiline
            numberOfLines={3}
          />
        </Card>

        <View style={styles.buttons}>
          <Button
            title="キャンセル"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
          <Button
            title="更新"
            onPress={handleSave}
            loading={isLoading}
            style={styles.button}
          />
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
  buttons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});