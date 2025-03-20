import { NextRequest, NextResponse } from 'next/server';

import { DeepSeekModel } from '@/app/types/deepseek';

export async function POST(req: NextRequest) {
  try {
    const { symbol, model = DeepSeekModel.r1, language = 'EN' } = await req.json();

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY_VOL_ENGINE;
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DeepSeek API key is not configured' },
        { status: 500 }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'status',
                content: `Analyzing ${symbol}...`,
              })}\n\n`
            )
          );

          // Set system prompt and user prompt based on language
          const systemPrompt = language === 'CN' 
            ? '你是一个专业的股票分析师，擅长分析股票数据并提供详细的投资建议。你需要从多个维度对股票进行全面分析，包括技术面、基本面、行业地位、风险因素和未来展望。请确保分析深入、数据充分，并给出明确的投资建议。重要：你必须以JSON格式返回数据，不要使用markdown格式。'
            : 'You are a professional stock analyst skilled at analyzing stock data and providing detailed investment advice. You need to comprehensively analyze stocks from multiple dimensions, including technical analysis, fundamentals, industry position, risk factors, and future outlook. Please ensure your analysis is in-depth, data-rich, and provides clear investment recommendations. Important: You must return data in JSON format, not in markdown format.';

          const userPrompt = language === 'CN'
            ? `请对股票代码 ${symbol} 进行全面分析，并以JSON格式返回以下结构的数据：

{
  "analysis": "总体分析概述",
  "technicalAnalysis": {
    "priceTrend": "价格走势分析，包括近期趋势、支撑位和阻力位",
    "technicalIndicators": "主要技术指标分析，如RSI、MACD、移动平均线等",
    "volume": "成交量分析及其含义",
    "patterns": "重要技术形态识别，如头肩顶、双底等"
  },
  "fundamentalAnalysis": {
    "financials": "关键财务指标分析，包括收入、利润、利润率、现金流等",
    "valuation": "估值指标分析，如PE、PB、PS等，及与行业平均的比较",
    "growth": "公司增长潜力和可持续性评估",
    "balance": "公司资产负债状况和财务健康度评估"
  },
  "industryAnalysis": {
    "position": "公司在行业中的市场份额和竞争优势",
    "trends": "行业整体发展趋势和前景",
    "competitors": "主要竞争对手分析及相对优劣势",
    "cycle": "当前行业所处周期阶段"
  },
  "riskFactors": {
    "market": "与整体市场相关的风险因素",
    "industry": "与行业相关的特定风险",
    "company": "与公司自身相关的特定风险",
    "regulatory": "可能影响公司的监管变化或政策风险"
  },
  "recommendations": [
    "具体投资建议1",
    "具体投资建议2",
    "具体投资建议3",
    "具体投资建议4"
  ],
  "priceTargets": {
    "shortTerm": "3个月内预测价格及依据",
    "midTerm": "6-12个月预测价格及依据",
    "longTerm": "1-3年预测价格及依据"
  },
  "sentiment": "整体投资情绪，必须是以下三种之一：positive、neutral、negative"
}

请确保返回的是有效的JSON格式，不要包含任何额外的文本、解释或markdown格式。`
            : `Please provide a comprehensive analysis of the stock with symbol ${symbol} and return the data in the following JSON structure:

{
  "analysis": "Overall analysis summary",
  "technicalAnalysis": {
    "priceTrend": "Price trend analysis, including recent trends, support and resistance levels",
    "technicalIndicators": "Analysis of key technical indicators such as RSI, MACD, moving averages, etc.",
    "volume": "Volume analysis and its implications",
    "patterns": "Identification of important technical patterns such as head and shoulders, double bottoms, etc."
  },
  "fundamentalAnalysis": {
    "financials": "Analysis of key financial metrics including revenue, profit, margins, cash flow, etc.",
    "valuation": "Analysis of valuation metrics such as PE, PB, PS, etc., and comparison with industry averages",
    "growth": "Assessment of company growth potential and sustainability",
    "balance": "Assessment of company assets, liabilities, and financial health"
  },
  "industryAnalysis": {
    "position": "Company's market share and competitive advantages in the industry",
    "trends": "Overall industry development trends and prospects",
    "competitors": "Analysis of main competitors and relative strengths and weaknesses",
    "cycle": "Current stage of the industry cycle"
  },
  "riskFactors": {
    "market": "Risk factors related to the overall market",
    "industry": "Specific risks related to the industry",
    "company": "Specific risks related to the company itself",
    "regulatory": "Regulatory changes or policy risks that may affect the company"
  },
  "recommendations": [
    "Specific investment recommendation 1",
    "Specific investment recommendation 2",
    "Specific investment recommendation 3",
    "Specific investment recommendation 4"
  ],
  "priceTargets": {
    "shortTerm": "3-month price forecast and rationale",
    "midTerm": "6-12 month price forecast and rationale",
    "longTerm": "1-3 year price forecast and rationale"
  },
  "sentiment": "Overall investment sentiment, must be one of the following: positive, neutral, negative"
}

Please ensure that the response is in valid JSON format without any additional text, explanations, or markdown formatting.`;

          // Call DeepSeek API with streaming enabled
          const response = await fetch(
            'https://api.siliconflow.cn/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: model, // Use the specified DeepSeek model
                messages: [
                  {
                    role: 'system',
                    content: systemPrompt,
                  },
                  {
                    role: 'user',
                    content: userPrompt,
                  },
                ],
                stream: true,
                max_tokens: 10000,
                temperature: 0.7,
                top_p: 0.7,
                top_k: 50,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status}`);
          }

          // Process the streaming response
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Failed to get response reader');
          }

          let accumulatedContent = '';
          let accumulatedThinking = '';
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Convert the chunk to text
            buffer += new TextDecoder().decode(value, { stream: true });

            // Process complete messages in the buffer
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim() === '') continue;
              if (!line.startsWith('data:')) continue;

              const data = line.slice(5).trim();
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const delta = json.choices[0]?.delta;

                if (delta) {
                  // Check for reasoning content (thinking process)
                  if (delta.reasoning_content) {
                    accumulatedThinking += delta.reasoning_content;
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: 'thinking',
                          content: delta.reasoning_content,
                        })}\n\n`
                      )
                    );
                  }

                  // Check for regular content
                  if (delta.content) {
                    accumulatedContent += delta.content;
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          type: 'content',
                          content: delta.content,
                        })}\n\n`
                      )
                    );
                  }
                }
              } catch (error) {
                console.error('Error parsing SSE message:', error);
              }
            }
          }

          // Send a final message with the complete data
          try {
            let finalData = {};
            try {
              // Try to parse the accumulated content as JSON
              finalData = JSON.parse(accumulatedContent);
            } catch (error) {
              console.error('Error parsing final content as JSON:', error);
              // If parsing fails, use a basic structure
              finalData = {
                analysis: accumulatedContent,
                recommendations: [],
                sentiment: 'neutral',
              };
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'complete',
                  content: finalData,
                  thinking: accumulatedThinking,
                })}\n\n`
              )
            );
          } catch (error) {
            console.error('Error sending final message:', error);
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                content: error instanceof Error ? error.message : 'Unknown error',
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
