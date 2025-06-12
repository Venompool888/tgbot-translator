const axios = require('axios');

async function translateWithGrok(text, targetLang, motherLang) {
  const apiKey = process.env.AI_API_KEY; // 从环境变量读取 API 密钥
  const endpoint = process.env.AI_API_ENDPOINT;
  const model = process.env.AI_MODEL;

  console.log('翻译原文：', text)

  const messages = [
    {
      role: 'system',
      content: `\n你是一个专业的实时翻译助手，用户会给你发信息，可能是母语（${motherLang}），也可能是其他任意外语。\n\n请遵守以下翻译规则：\n1. 如果内容是 ${motherLang}，请翻译成 ${targetLang}；\n2. 如果内容是任何其他语言（无论是哪种外语），都翻译成 ${motherLang}；\n3. 翻译时要自然、地道、保留原文的语气、情绪和粗俗程度；\n4. 保留专有名词、代码、格式和标点；\n5. 严格只返回翻译结果，不要原文，不要解释，不要输出语言名称。\n    `.trim(),
    },
    {
      role: 'user',
      content: `翻译：${text}`,
    },
  ];

  try {
    const response = await axios.post(
      endpoint,
      {
        model: model,
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const translatedText = response.data.choices[0].message.content;
    console.log('翻译结果:',translatedText)
  
    return translatedText;
  } catch (error) {
    console.error('翻译失败:', error.response ? error.response.data : error.message);
    return '⚠️ 翻译失败，请稍后再试。';
  }
};

async function translateOtherLangWithGrok(text, targetLang, firstResult) {
  const apiKey = process.env.AI_API_KEY; // 从环境变量读取 API 密钥
  const endpoint = process.env.AI_API_ENDPOINT;
  const model = process.env.AI_MODEL;

  const messages = [
    {
      role: 'system',
      content: `你是一个全语言翻译助手，请准确、自然地翻译用户提供的句子，不要解释.保持原意不变，包括情绪、语气、词汇粗俗程度等要素。语言表达应自然、地道，符合目标语言的语言习惯和文化背景。不得美化、改写、隐去任何信息；必要时可优化句子结构以符合语言习惯。请直接返回翻译结果，无需任何解释或附加说明。`,
    },
    {
      role: 'user',
      content: `
原文是：「${text}」  
已有翻译为：「${firstResult}」  
请基于这两者，将其准确自然地翻译成「${targetLang}」。
    `.trim()
    }
  ];

  try {
    const response = await axios.post(
      endpoint,
      {
        model: model,
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const translatedText = response.data.choices[0].message.content;
    return translatedText;
  } catch (error) {
    console.error('翻译失败:', error.response ? error.response.data : error.message);
    return '⚠️ 翻译失败，请稍后再试。';
  }
};

module.exports = {
  translateWithGrok,
  translateOtherLangWithGrok
};
