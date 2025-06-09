
// src/ui/screens/PromptsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { usePrompts } from '../../contexts/AppContext';
import { Card, Button, Empty, Badge } from '../../components/common';
import { Prompt, PromptLabel } from '../../types/models';
import { MainTabScreenProps } from '../../types/navigation';

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

type Props = MainTabScreenProps<'Prompts'>;

export const PromptsScreen: React.FC<Props> = ({ navigation }) => {
  const { prompts, searchPrompts, getPromptsByLabel } = usePrompts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<PromptLabel | null>(null);

  const filteredPrompts = selectedLabel
    ? getPromptsByLabel(selectedLabel)
    : searchQuery
    ? searchPrompts(searchQuery)
    : prompts;

  const renderPromptItem = ({ item }: { item: Prompt }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PromptDetail', { promptId: item.id })}
    >
      <Card style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <Badge
            label={labelNames[item.label]}
            backgroundColor={labelColors[item.label]}
          />
          <Text style={styles.promptDate}>
            {new Date(item.createdAt).toLocaleDateString('ja-JP')}
          </Text>
        </View>
        <Text style={styles.promptContent} numberOfLines={3}>
          {item.content}
        </Text>
        {item.memo && (
          <Text style={styles.promptMemo} numberOfLines={2}>
            メモ: {item.memo}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="プロンプトを検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* ラベルフィルター */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.labelFilter}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedLabel && styles.filterChipActive,
          ]}
          onPress={() => setSelectedLabel(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              !selectedLabel && styles.filterChipTextActive,
            ]}
          >
            すべて
          </Text>
        </TouchableOpacity>
        {Object.entries(labelNames).map(([key, name]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterChip,
              selectedLabel === key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedLabel(key as PromptLabel)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedLabel === key && styles.filterChipTextActive,
              ]}
            >
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* プロンプトリスト */}
      <FlatList
        data={filteredPrompts}
        renderItem={renderPromptItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Empty message="プロンプトがありません" />
        }
      />

      {/* FAB */}
      <Button
        title="＋"
        style={styles.fab}
        onPress={() => navigation.navigate('PromptCreate')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  labelFilter: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    maxHeight: 50,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  promptCard: {
    marginBottom: 12,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptDate: {
    fontSize: 12,
    color: '#999',
  },
  promptContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  promptMemo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});