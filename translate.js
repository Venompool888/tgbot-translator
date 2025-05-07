const axios = require('axios');

async function translateWithGrok(text, targetLang, motherLang) {
  const apiKey = process.env.GROK_API_KEY; // 从环境变量读取 API 密钥
  const endpoint = process.env.GROK_API_ENDPOINT;


  const messages = [
    {
      role: 'system',
      content: `
      你是一个专业的翻译助手，具备母语级的中英俄文语言能力。
      你是一个专业的中英俄互译助手，具备母语级的中英俄文语言能力。
      请将用户提供的文本进行精准翻译，保持原意不变，同时语言表达自然、地道，符合目标语言的语言习惯和文化背景。
      不要逐字直译，必要时可对句子结构进行优化。请直接给出翻译结果，不需要解释或附加说明。`,
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

async function translateOtherLangWithGrok(text, otherLang) {
  const apiKey = '删除中文填上你的api key'; // 替换为您的 API 密钥
  const endpoint = 'https://api.x.ai/v1/chat/completions';

  const messages = [
    {
      role: 'system',
      content: `
      你是一个专业的翻译助手，具备母语级的中英俄文语言能力。
      你是一个专业的中英俄互译助手，具备母语级的中英俄文语言能力。
      请将用户提供的文本进行精准翻译，保持原意不变，同时语言表达自然、地道，符合目标语言的语言习惯和文化背景。
      不要逐字直译，必要时可对句子结构进行优化。请直接给出翻译结果，不需要解释或附加说明。`,
    },
    {
      role: 'user',
      content: `翻译成${otherLang}：${text}`,
    },
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
