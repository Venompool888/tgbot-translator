const axios = require('axios');

async function translateWithGrok(text, targetLang, motherLang) {
  const apiKey = process.env.AI_API_KEY; // 从环境变量读取 API 密钥
  const endpoint = process.env.AI_API_ENDPOINT;
  const model = process.env.AI_MODEL;

 console.log('翻译原文：',text)
  const messages = [
    {
      role: 'system',
      content: `你是一个专业的翻译助手，具备多语言翻译能力，能够在任意语言之间进行高质量翻译。请将用户提供的文本准确翻译为目标语言，保持原意不变，语言表达自然、地道，符合目标语言的语言习惯和文化背景。不要逐字直译，必要时可优化句子结构。请直接返回翻译结果，无需任何解释或附加说明。`,
    },
    {
      role: 'user',
      content: `翻译成${motherLang},如果本身就是${motherLang},就翻译成${targetLang}：${text}`,
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
      content: `你是一个全语言翻译助手，请准确、自然地翻译用户提供的句子，不要解释`,
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
        model: 'grok-3-fast-beta',
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
