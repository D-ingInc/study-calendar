
// src/domain/prompt/PromptService.ts

import { PromptLabel } from '../../types/models';
import { IPromptRepository } from '../../data/repositories/interfaces';

export class PromptService {
  constructor(private promptRepository: IPromptRepository) {}

  /**
   * プロンプトの使用頻度を分析
   */
  async analyzePromptUsage(): Promise<{
    mostUsedLabel: PromptLabel;
    labelCounts: Record<PromptLabel, number>;
    totalPrompts: number;
    averageLength: number;
  }> {
    const prompts = await this.promptRepository.findAll();
    
    const labelCounts: Record<PromptLabel, number> = {
      [PromptLabel.CHATGPT]: 0,
      [PromptLabel.CLAUDE]: 0,
      [PromptLabel.GEMINI]: 0,
      [PromptLabel.DEEPSEEK]: 0,
      [PromptLabel.PROGRAMMING]: 0,
      [PromptLabel.OTHER]: 0,
    };
    
    let totalLength = 0;
    
    prompts.forEach(prompt => {
      labelCounts[prompt.label]++;
      totalLength += prompt.content.length;
    });
    
    const mostUsedLabel = Object.entries(labelCounts)
      .sort(([, a], [, b]) => b - a)[0][0] as PromptLabel;
    
    return {
      mostUsedLabel,
      labelCounts,
      totalPrompts: prompts.length,
      averageLength: prompts.length > 0 ? Math.round(totalLength / prompts.length) : 0,
    };
  }

  /**
   * プロンプトのテンプレートを提案
   */
  getSuggestedTemplates(label: PromptLabel): string[] {
    const templates: Record<PromptLabel, string[]> = {
      [PromptLabel.CHATGPT]: [
        'Pythonで[具体的なタスク]を実装するコードを書いてください。',
        '[概念]について、初心者にもわかりやすく説明してください。',
        '以下のコードのエラーを修正してください：\n```python\n[コード]\n```',
      ],
      [PromptLabel.CLAUDE]: [
        '[トピック]について、詳細に解説してください。',
        '以下の要件でPythonプログラムを作成してください：\n- [要件1]\n- [要件2]',
        '[質問]について、メリットとデメリットを比較してください。',
      ],
      [PromptLabel.GEMINI]: [
        '[技術]の基本的な使い方を教えてください。',
        '[プログラミング言語]で[アルゴリズム]を実装してください。',
        '[エラーメッセージ]の原因と解決方法を教えてください。',
      ],
      [PromptLabel.DEEPSEEK]: [
        '[数学的問題]を解いてください。',
        '[アルゴリズム]の時間計算量を分析してください。',
        '[技術的概念]の実装例を示してください。',
      ],
      [PromptLabel.PROGRAMMING]: [
        '[言語]で[機能]を実装する方法を教えてください。',
        '以下のコードを最適化してください：\n```\n[コード]\n```',
        '[デザインパターン]の実装例を示してください。',
      ],
      [PromptLabel.OTHER]: [
        '[質問内容]',
        '[タスク]を手伝ってください。',
        '[トピック]について教えてください。',
      ],
    };
    
    return templates[label] || templates[PromptLabel.OTHER];
  }

  /**
   * プロンプトの品質スコアを計算
   */
  calculatePromptQuality(prompt: string): {
    score: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 100;
    
    // 長さチェック
    if (prompt.length < 20) {
      score -= 20;
      suggestions.push('もう少し詳細な説明を追加してください');
    } else if (prompt.length > 1000) {
      score -= 10;
      suggestions.push('プロンプトが長すぎます。要点を整理してください');
    }
    
    // 具体性チェック
    const vagueWords = ['これ', 'それ', 'あれ', 'なんか', 'ちょっと'];
    const hasVagueWords = vagueWords.some(word => prompt.includes(word));
    if (hasVagueWords) {
      score -= 15;
      suggestions.push('より具体的な表現を使用してください');
    }
    
    // 構造チェック
    if (!prompt.includes('。') && !prompt.includes('\n')) {
      score -= 10;
      suggestions.push('文章を区切って読みやすくしてください');
    }
    
    // 質問の明確性
    if (!prompt.includes('？') && !prompt.includes('ください') && !prompt.includes('教えて')) {
      score -= 5;
      suggestions.push('質問や依頼を明確にしてください');
    }
    
    return {
      score: Math.max(0, score),
      suggestions,
    };
  }
}