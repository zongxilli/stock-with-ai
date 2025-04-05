'use client';

import { JSX } from 'react';

import JsonFormatter from '@/components/custom/json-formatter';
import EnhancedTextFormatter from '@/components/custom/text-formatter-enhanced';

interface SequentialThinkingStep {
  step: number;
  title: string;
  content: string;
}

interface AIAssistantData {
  [key: string]: any;
  sentiment?: string;
  summary?: string;
  technicalOutlook?: any;
  scenarios?: any;
  actionPlan?: any;
  sequentialThinking?: SequentialThinkingStep[];
}

interface AIAnalysisResultProps {
  data: AIAssistantData | null;
}

/**
 * AI 分析结果组件 - 用于展示 AI 分析的结果
 */
export function AIAnalysisResult({ data }: AIAnalysisResultProps) {
  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 首先显示情感分析 */}
      {data.sentiment && (
        <div className="p-4 rounded-lg border mb-6">
          <div className="text-center">
            <span className="font-medium text-lg">
              Overall Sentiment:{' '}
            </span>
            <span
              className={`font-bold text-lg ${
                data.sentiment.toLowerCase() === 'positive'
                  ? 'text-green-500'
                  : data.sentiment.toLowerCase() === 'negative'
                    ? 'text-red-500'
                    : 'text-yellow-500'
              }`}
            >
              {data.sentiment}
            </span>
          </div>
        </div>
      )}

      {/* 显示摘要 */}
      {data.summary && (
        <div className="mb-6 p-4 rounded-lg border">
          <h3 className="font-medium text-lg mb-2">
            Summary
          </h3>
          <p className="text-sm leading-relaxed">
            {data.summary}
          </p>
        </div>
      )}

      {/* 技术展望部分 */}
      {data.technicalOutlook && (
        <div className="border p-4 rounded-lg mb-6">
          <h3 className="font-medium text-lg mb-3">
            Technical Outlook
          </h3>
          {renderContent(data.technicalOutlook)}
        </div>
      )}

      {/* 情景分析部分 */}
      {data.scenarios && (
        <div className="border p-4 rounded-lg mb-6">
          <h3 className="font-medium text-lg mb-3">
            Scenarios
          </h3>
          {renderContent(data.scenarios)}
        </div>
      )}

      {/* 行动计划部分 */}
      {data.actionPlan && (
        <div className="border p-4 rounded-lg mb-6">
          <h3 className="font-medium text-lg mb-3">
            Action Plan
          </h3>
          {renderContent(data.actionPlan)}
        </div>
      )}

      {/* 动态渲染其他字段 */}
      <div className="space-y-6">
        {Object.entries(getMainContent(data) || {}).map(([key, value]) => {
          // 跳过已经单独显示的字段
          if (
            [
              'sentiment',
              'summary',
              'technicalOutlook',
              'scenarios',
              'actionPlan',
              'sequentialThinking',
            ].includes(key)
          ) {
            return null;
          }

          return (
            <div
              key={key}
              className="border p-4 rounded-lg"
            >
              <h3 className="font-medium text-lg mb-3 capitalize">
                {formatKeyName(key)}
              </h3>
              {renderContent(value)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 渲染思考过程组件 - 展示 AI 思考的过程
 */
export function AIThinkingProcess({ thinking, thinkingContent }: { thinking: string, thinkingContent: string }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="p-3 rounded-lg bg-muted border border-border">
        <h3 className="font-medium mb-2">
          Thinking Process
        </h3>
        <div
          className="font-mono whitespace-pre-wrap overflow-y-auto max-h-[400px] text-foreground"
        >
          {thinking ? (
            <EnhancedTextFormatter
              text={thinking}
              mode="paragraphs-only"
              className="m-4"
            />
          ) : (
            'No thinking process available.'
          )}
          {thinkingContent && (
            <JsonFormatter
              data={thinkingContent}
              initiallyExpanded
            />
          )}
        </div>
      </div>
    </div>
  );
}

// 格式化键名，例如将camelCase转换为空格分隔的单词
const formatKeyName = (key: string): string => {
  // 中英文字段映射表
  const keyTranslations: Record<string, string> = {
    // 顶级字段翻译
    sentiment: '整体情绪',
    summary: '摘要分析',
    technicalOutlook: '技术展望',
    scenarios: '市场情景',
    actionPlan: '行动计划',

    // technicalOutlook 子字段翻译
    currentTrend: '当前趋势',
    volumePriceAnalysis: '量价分析',
    keyLevels: '关键价位',
    supports: '支撑位',
    resistances: '阻力位',

    // scenarios 子字段翻译
    bullishScenario: '看涨情景',
    bearishScenario: '看跌情景',
    trigger: '触发条件',
    tradingStrategy: '交易策略',
    priceTargets: '价格目标',

    // actionPlan 子字段翻译
    immediateRecommendation: '即时建议',
    riskManagement: '风险管理',

    // specificActions 子字段翻译
    entry: '入场点',
    stopLoss: '止损点',
    profitTargets: '获利目标',
    positionManagement: '仓位管理',

    // 常见属性翻译
    price: '价格',
    level: '水平',
    significance: '重要性',
    rationale: '理由',
    reason: '原因',
  };

  // 先检查映射表中是否有对应的中文翻译
  if (key in keyTranslations) {
    return keyTranslations[key];
  }

  // 如果没有找到翻译，使用原始的格式化逻辑
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

// 过滤掉特殊键，只保留主要内容
const getMainContent = (data: AIAssistantData) => {
  if (!data) return null;

  // 创建一个从数据中过滤掉我们不想展示的键的复制版本
  const filteredData = { ...data };

  // 移除thinking相关的数据，它在另一个标签页中显示
  const keysToRemove = ['sequentialThinking'];
  keysToRemove.forEach((key) => {
    if (key in filteredData) {
      delete filteredData[key];
    }
  });

  return filteredData;
};

// 动态渲染内容的函数
const renderContent = (
  content: any,
  depth = 0
): JSX.Element => {
  // 处理空值
  if (content === null || content === undefined) {
    return <p className='text-muted-foreground'>暂无数据</p>;
  }

  // 处理字符串
  if (typeof content === 'string') {
    return <p className='text-sm leading-relaxed'>{content}</p>;
  }

  // 处理数字
  if (typeof content === 'number') {
    return <p className='text-sm font-medium'>{content}</p>;
  }

  // 处理布尔值
  if (typeof content === 'boolean') {
    return (
      <p className='text-sm font-medium'>{content ? 'Yes' : 'No'}</p>
    );
  }

  // 处理数组
  if (Array.isArray(content)) {
    if (content.length === 0) {
      return <p className='text-muted-foreground'>暂无数据</p>;
    }

    // 特殊处理：如果数组中的项都是字符串或数字（简单类型的数组）
    if (
      content.every(
        (item) =>
          typeof item === 'string' || typeof item === 'number'
      )
    ) {
      return (
        <ul className='list-disc pl-5 space-y-1 text-xs'>
          {content.map((item, index) => (
            <li key={index} className='text-muted-foreground'>
              {item}
            </li>
          ))}
        </ul>
      );
    }

    // 通用处理支撑位/阻力位/价格目标等带有price、price属性或level属性的对象数组
    if (
      content.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          ('price' in item || 'level' in item)
      )
    ) {
      return (
        <div className='space-y-2'>
          {content.map((item, index) => (
            <div
              key={index}
              className='mb-3 p-2 border-l-2 border-muted pl-2'
            >
              <div className='flex items-center gap-2 mb-1'>
                <span className='font-medium'>
                  {item.price || item.level}
                </span>
              </div>
              {/* 处理多种可能的说明字段名 */}
              {(item.significance ||
                item.rationale ||
                item.reason) && (
                <div className='ml-2'>
                  <p className='text-xs text-muted-foreground'>
                    —{' '}
                    {item.significance ||
                      item.rationale ||
                      item.reason}
                  </p>
                </div>
              )}
              {/* 处理原因数组 */}
              {item.reasons &&
                Array.isArray(item.reasons) && (
                <div className='ml-2'>
                  <ul className='list-disc pl-4 space-y-1 text-xs text-muted-foreground'>
                    {item.reasons.map(
                      (
                        reason: string,
                        idx: number
                      ) => (
                        <li key={idx}>
                          {reason}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // 一般数组处理
    return (
      <ul className='list-disc pl-5 space-y-2 text-sm'>
        {content.map((item, index) => (
          <li key={index} className='leading-relaxed'>
            {typeof item === 'object'
              ? renderContent(item, depth + 1)
              : item}
          </li>
        ))}
      </ul>
    );
  }

  // 处理对象
  if (typeof content === 'object') {
    // 检测对象模式和布局
    const keys = Object.keys(content);

    // 检查是否应该使用网格布局（适用于键值对较多的对象）
    const shouldUseGrid =
      keys.length > 2 &&
      keys.every(
        (key) =>
          typeof content[key] !== 'object' ||
          content[key] === null ||
          (Array.isArray(content[key]) &&
            content[key].length === 0)
      );

    // 如果是一个具有price属性的对象（单个支撑位/阻力位）
    if ('price' in content || 'level' in content) {
      return (
        <div className='mb-3 p-2 border-l-2 border-muted pl-2'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='font-medium'>
              {content.price || content.level}
            </span>
          </div>
          {/* 处理多种可能的说明字段名 */}
          {(content.significance ||
            content.rationale ||
            content.reason) && (
            <div className='ml-2'>
              <p className='text-xs text-muted-foreground'>
                —{' '}
                {content.significance ||
                  content.rationale ||
                  content.reason}
              </p>
            </div>
          )}
          {content.reasons && Array.isArray(content.reasons) && (
            <div className='ml-2'>
              <ul className='list-disc pl-4 space-y-1 text-xs text-muted-foreground'>
                {content.reasons.map(
                  (reason: string, idx: number) => (
                    <li key={idx}>{reason}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // 使用网格布局（适用于具有多个简单键值的对象）
    if (shouldUseGrid) {
      return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {Object.entries(content).map(([key, value]) => (
            <div
              key={key}
              className='p-2 border rounded-md bg-muted/30'
            >
              <h5 className='font-medium text-xs uppercase mb-1'>
                {formatKeyName(key)}
              </h5>
              <p className='text-xs text-muted-foreground'>
                {String(value)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    // 默认对象布局
    return (
      <div className={`space-y-3 ${depth > 0 ? 'ml-2 mt-2' : ''}`}>
        {Object.entries(content).map(([key, value]) => {
          // 跳过空值
          if (value === null || value === undefined) return null;

          // 估计子对象的复杂度
          const isComplexValue =
            typeof value === 'object' &&
            value !== null &&
            (Array.isArray(value)
              ? value.length > 0
              : Object.keys(value).length > 0);

          // 布局调整（针对不同复杂度的对象）
          const sectionClass = isComplexValue
            ? `${depth > 0 ? 'mb-3' : 'mb-4'} ${depth > 1 ? 'border-l pl-3' : ''}`
            : `${depth > 0 ? 'mb-2' : 'mb-3'}`;

          return (
            <div key={key} className={sectionClass}>
              <h4
                className={`font-medium mb-1 ${depth > 0 ? 'text-sm' : 'text-base'} capitalize`}
              >
                {formatKeyName(key)}
              </h4>
              {renderContent(value, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  }

  // 处理其他类型
  return <p className='text-sm'>{String(content)}</p>;
};
