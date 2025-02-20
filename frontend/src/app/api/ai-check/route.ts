// src/app/api/ai-check/route.ts
import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function POST(request: Request) {
  const { code, model } = await request.json();

  // 如果没有 code，返回错误
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

   // 默认模型
   const selectedModel = model;

  // 调用后端的验证接口，确保 model 是有效的
  const validateRes = await fetch(
    `${BACKEND_API_URL}/ai-models/validate?model=${encodeURIComponent(selectedModel)}`
  );
  if (!validateRes.ok) {
    throw new Error('Failed to validate model');
  }
  const { valid } = await validateRes.json();
  if (!valid) {
    return NextResponse.json({ error: 'Invalid model selected' }, { status: 400 });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    return NextResponse.json({ error: 'OpenAI API Key not configured' }, { status: 500 });
  }

  // 准备向OpenAI发送的提示信息(Prompt)，可根据需要调整
  const prompt = `
检查要求：
请对以下代码进行检查，并指出语法错误，列出错误代码及错误原因。
改进代码部分需包含两方面：一是修正错误，二是遵循最佳实践，且只列出需要修改的代码片段及对应修正。 
最佳实践部分则给出遵循最佳实践的完整改进后代码。

输出格式要求：
请严格按照下面的格式返回，不要添加多余说明：

检查结果:
[在此处写检查结果内容，指出语法错误，列出错误代码及错误原因]

---SPLIT---

改进代码:
[在此处写改进代码内容，只列出需要修改的代码和对应的修改后的代码，不需要列出整个代码。]

---SPLIT---

最佳实践:
[在此处给出完全符合最佳实践的完整改进后代码。]

下面是代码:
${code}
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: 'You are a helpful assistant skilled at reviewing and improving code.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to call OpenAI API', details: errorData }, { status: 500 });
    }

    const result = await response.json();
    const fullText = result.choices?.[0]?.message?.content || '';

    // 使用指定分隔符来分割文本
    const [checkSection, improveSection, practiceSection] = fullText.split('---SPLIT---');

    let checkResults = '未解析到检查结果';
    let improvedCode = '未解析到改进代码';
    let bestPractice = '未解析到最佳实践';

    if (checkSection && checkSection.includes('检查结果:')) {
      // 去除前后的空格并去掉"检查结果:"行
      checkResults = checkSection.trim().replace(/^检查结果:\s*/, '');
    }

    if (improveSection && improveSection.includes('改进代码:')) {
      // 去除前后的空格并去掉"改进代码:"行
      improvedCode = improveSection.trim().replace(/^改进代码:\s*/, '');
    }

    if (practiceSection && practiceSection.includes('最佳实践:')) {
      bestPractice = practiceSection.trim().replace(/^最佳实践:\s*/, '');
    }

    return NextResponse.json({ checkResults, improvedCode, bestPractice });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Exception occurred', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
