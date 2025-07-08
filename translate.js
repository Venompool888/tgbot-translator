const axios = require('axios');

async function translateWithGrok(text, targetLang, motherLang, systemPrompt) {
  const apiKey = process.env.AI_API_KEY; // 从环境变量读取 API 密钥
  const endpoint = process.env.AI_API_ENDPOINT;
  const model = process.env.AI_MODEL;

  console.log('翻译原文：', text)

  // 根据 motherLang 选择默认提示词（支持多种写法）
  let defaultPrompt;
  const ml = motherLang ? motherLang.trim().toLowerCase() : '';
  if ([
    'en', 'english', '英文'
  ].includes(ml)) {
    defaultPrompt = `\nYou are a professional real-time translation assistant. The user may send you messages in their mother tongue (${motherLang}) or any other foreign language.\n\nPlease follow these translation rules:\n1. If the content is in ${motherLang}, translate it into ${targetLang};\n2. If the content is in any other language, translate it into ${motherLang};\n3. The translation should be natural, idiomatic, and retain the tone, emotion, and level of vulgarity of the original;\n4. Preserve proper nouns, code, formatting, and punctuation;\n5. Strictly return only the translation result, no original text, no explanation, no language name.`.trim();
  } else if ([
    'ru', 'russian', 'русский', 'русский язык', '俄语'
  ].includes(ml)) {
    defaultPrompt = `\nВы профессиональный помощник для перевода в реальном времени. Пользователь может отправлять вам сообщения на родном языке (${motherLang}) или на любом другом иностранном языке.\n\nПожалуйста, следуйте этим правилам перевода:\n1. Если сообщение на ${motherLang}, переведите его на ${targetLang};\n2. Если сообщение на любом другом языке, переведите его на ${motherLang};\n3. Перевод должен быть естественным, соответствовать оригиналу по тону, эмоциям и степени грубости;\n4. Сохраняйте имена собственные, код, форматирование и пунктуацию;\n5. Строго возвращайте только результат перевода, без оригинального текста, объяснений и указания языка.`.trim();
  } else {
    defaultPrompt = `\n你是一个专业的实时翻译助手，用户会给你发信息，可能是母语（${motherLang}），也可能是其他任意外语。\n\n请遵守以下翻译规则：\n1. 如果内容是 ${motherLang}，请翻译成 ${targetLang}；\n2. 如果内容是任何其他语言（无论是哪种外语），都翻译成 ${motherLang}；\n3. 翻译时要自然、地道、保留原文的语气、情绪和粗俗程度；\n4. 保留专有名词、代码、格式和标点；\n5. 严格只返回翻译结果，不要原文，不要解释，不要输出语言名称。`.trim();
  }

  const messages = [
    {
      role: 'system',
      content: systemPrompt && systemPrompt.trim() ? systemPrompt : defaultPrompt,
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
