// src/ui/screens/PromptCreateScreen.tsx

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { usePrompts } from '../../contexts/AppContext';
import { Input, Button, Card } from '../../components/common';
import { Prompt, PromptLabel } from '../../types/models';

const labelOptions = [
  { label: 'ChatGPT', value: PromptLabel.CHATGPT },
  { label: 'Claude', value: PromptLabel.CLAUDE },
  { label: 'Gemini', value: PromptLabel.GEMINI },
  { label: 'DeepSeek', value: PromptLabel.DEEPSEEK },
  { label: 'プログラミング', value: PromptLabel.PROGRAMMING },
  { label: 'その他', value: PromptLabel.OTHER },
];

export const PromptCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const { createPrompt } = usePrompts();

  const [content, setContent] = useState('');
  const [label, setLabel] = useState(PromptLabel.CHATGPT);
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('エラー', 'プロンプトを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const newPrompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> = {
        content: content.trim(),
        label,
        memo: memo.trim() || undefined,
      };

      await createPrompt(newPrompt);
      navigation.goBack();
    } catch {
      Alert.alert('エラー', 'プロンプトの保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

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

          <View style={styles.field}>
            <Text style={styles.label}>ラベル</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={label}
                onValueChange={setLabel}
                style={styles.picker}
              >
                {labelOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

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
            title="保存"
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
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  picker: {
    height: 50,
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