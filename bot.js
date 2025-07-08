require('dotenv').config();
const { Telegraf } = require('telegraf');
const { translateWithGrok, translateOtherLangWithGrok } = require('./translate');
const { textToMp3, mp3ToOgg } = require('./tts');
const { processOggToText } = require('./stt');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
// 从环境变量读取 token
const botToken = process.env.BOT_TOKEN;

const sessions = {}; // 存储会话数据

const bot = new Telegraf(botToken); 

const userConfigPath = './userConfig.json';

// 加载用户配置、验证用户权限
function loadUserConfig() {
  if (!fs.existsSync(userConfigPath)) {
    ctx.reply('❌ 你没有权限使用本机器人。\n❌ You do not have permission to use this bot.\n❌ У вас нет прав на использование этого бота.');
    return false;
  }
  return JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));
}


// 按用户母语返回按钮文本
function getButtonText(key, lang) {
  const dict = {
    'create_audio': {
      '简体中文': '🗣️ 生成语音',
      '中文': '🗣️ 生成语音',
      '英文': '🗣️ Create Audio',
      'English': '🗣️ Create Audio',
      '俄语': '🗣️ Создать аудио',
      'Russian': '🗣️ Создать аудио',
      // 可扩展更多语言
    },
    'translate_to': {
      '简体中文': (lang) => `翻译成${lang}`,
      '中文': (lang) => `翻译成${lang}`,
      '英文': (lang) => `Translate to ${lang}`,
      'English': (lang) => `Translate to ${lang}`,
      '俄语': (lang) => `Перевести на ${lang}`,
      'Russian': (lang) => `Перевести на ${lang}`,
      // 可扩展更多语言
    }
  };
  return dict[key]?.[lang] || dict[key]?.['English'] || key;
}

// 多语言文本字典
function getLangText(key, lang, param) {
  const dict = {
    'not_found': {
      '简体中文': '⚠️ 没有找到原始翻译内容，请重新发送文本。',
      '英文': '⚠️ Original text not found, please resend.',
      'English': '⚠️ Original text not found, please resend.',
      '俄语': '⚠️ Оригинальный текст не найден, пожалуйста, отправьте снова.',
      'Russian': '⚠️ Оригинальный текст не найден, пожалуйста, отправьте снова.'
    },
    'translate_error': {
      '简体中文': '⚠️ 翻译过程中出现错误，请稍后重试',
      '英文': '⚠️ An error occurred during translation, please try again later.',
      'English': '⚠️ An error occurred during translation, please try again later.',
      '俄语': '⚠️ Произошла ошибка при переводе, попробуйте позже.',
      'Russian': '⚠️ Произошла ошибка при переводе, попробуйте позже.'
    },
    'audio_error': {
      '简体中文': '⚠️ 创建音频过程中出现错误，请稍后重试',
      '英文': '⚠️ An error occurred while creating audio, please try again later.',
      'English': '⚠️ An error occurred while creating audio, please try again later.',
      '俄语': '⚠️ Произошла ошибка при создании аудио, попробуйте позже.',
      'Russian': '⚠️ Произошла ошибка при создании аудио, попробуйте позже.'
    },
    'creating_audio': {
      '简体中文': '🗣️ 正在生成语音，请稍候…',
      '英文': '🗣️ Creating the voice msg, please wait...',
      'English': '🗣️ Creating the voice msg, please wait...',
      '俄语': '🗣️ Генерируется голосовое сообщение, подождите...',
      'Russian': '🗣️ Генерируется голосовое сообщение, подождите...'
    },
    'translate_result': {
      '简体中文': '翻译结果',
      '英文': 'Translation Result',
      'English': 'Translation Result',
      '俄语': 'Результат перевода',
      'Russian': 'Результат перевода'
    },
    '文本生成中': {
      '简体中文': '文本生成中，请稍候...',
      '英文': 'Generating text, please wait...',
      'English': 'Generating text, please wait...',
      '俄语': 'Генерация текста, пожалуйста, подождите...',
      'Russian': 'Генерация текста, пожалуйста, подождите...'
    },
    '语音转换结果': {
      '简体中文': '语音转换结果',
      '英文': 'Voice conversion result',
      'English': 'Voice conversion result',
      '俄语': 'Результат преобразования голоса',
      'Russian': 'Результат преобразования голоса'
    },
    // ...可扩展更多
  };
  return dict[key]?.[lang] || dict[key]?.['English'] || key;
}

// 处理所有文本消息
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  const userConfig = loadUserConfig();

  if (!userConfig[userId]) {
    return ctx.reply('❌ 你没有权限使用本机器人。\n❌ You do not have permission to use this bot.\n❌ У вас нет прав на использование этого бота.');
  }

  const targetLang = userConfig[userId].targetlang;
  const motherLang = userConfig[userId].motherlang;
  const otherLang = userConfig[userId].otherlang;
  const systemPrompt = userConfig[userId].systemprompt || '';

  const result = await translateWithGrok(text, targetLang, motherLang, systemPrompt); // 调用翻译函数

  // 存储
  sessions[userId] = {
    text: text,       // 原始发来的文字
    result: result    // 翻译出来的结果
  };
  

  // 构建按钮
  const buttons = [];

  // 仅在 TTS_ENABLE=true 时显示 create audio 按钮
  if (process.env.TTS_ENABLE === 'true') {
    buttons.push([{ text: getButtonText('create_audio', motherLang), callback_data: 'create_audio' }]);
  }

  if (otherLang && otherLang.length > 0) {
    otherLang.forEach((lang, index) => {
      buttons.push([{ text: getButtonText('translate_to', motherLang)(lang), callback_data: `translate_${lang}` }]);
    });
  }

  // 回复翻译结果（分两条消息，先标题再内容）
  await ctx.reply(`\`${getLangText('translate_result', motherLang)}:\``, { parse_mode: 'MarkdownV2' });
  await ctx.reply(`\`\`\`\n${result}\n\`\`\``, { parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: buttons,
    }
  });
});

// 翻译成其他语言
bot.action(/^translate_(.+)$/, async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userConfig = loadUserConfig();
    
    const motherLang = userConfig[userId]?.motherlang || 'English';
    const targetLang = ctx.match[1]; // 正则取出需要翻译的目标语言，比如 ja, fr, de
    const text = sessions[userId].text; // 获取会话中存储的原文
    const firstResult = sessions[userId].result; // 获取会话中存储的翻译结果
    

    if (!text) {
      return ctx.reply(getLangText('not_found', motherLang));
    }

    const otherLangResult = await translateOtherLangWithGrok(text, targetLang, firstResult);
    sessions[userId].result = otherLangResult; // 更新会话中的翻译结果

    // 构建按钮
    const buttons = [];
    // 仅在 TTS_ENABLE=true 时显示 create audio 按钮
    if (process.env.TTS_ENABLE === 'true') {
      buttons.push([{ text: getButtonText('create_audio', motherLang), callback_data: 'create_audio' }]);
    }

    // 先回复标题
    await ctx.reply(`\`${getLangText('translate_result', motherLang)}:\``, { parse_mode: 'MarkdownV2' });
    // 再回复内容和按钮
    await ctx.reply(`\`\`\`\n${otherLangResult}\n\`\`\``, { 
      parse_mode: 'MarkdownV2',
      reply_markup: {
      inline_keyboard: buttons,
      }
    });

  } catch (error) {
    console.error('Error in translate_otherlang:', error);
    await ctx.reply(getLangText('translate_error', motherLang));
  }
});

// 处理用户发来的语音消息
bot.on('voice', async (ctx) => {
  try {
    const fileId = ctx.message.voice.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    const oggPath = path.join(__dirname, 'input.ogg');
    const outputTextPath = path.join(__dirname, 'output.txt');

    // 多语言提示，回复用户文本生成中。。。
    const userId = ctx.from.id;
    const userConfig = loadUserConfig();
    const motherLang = userConfig[userId]?.motherlang || 'English';
    const targetLang = userConfig[userId]?.targetlang || 'English';
    await ctx.reply(getLangText('文本生成中', motherLang));
    // 下载语音文件
    const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
    fs.writeFileSync(oggPath, response.data);

    // 转换语音文件并处理
    await processOggToText(oggPath, outputTextPath);

    // 读取转换后的文本
    const text = fs.readFileSync(outputTextPath, 'utf8');

    // 回复用户转换结果（多语言）
    await ctx.reply(`\`${getLangText('语音转换结果', motherLang)}:\``, { parse_mode: 'MarkdownV2' });
    await ctx.reply(`\`\`\`\n${text}\n\`\`\``, { parse_mode: 'MarkdownV2' });

    // 翻译转换出来的文本
    const result = await translateWithGrok(text, targetLang, motherLang);
    // 回复用户翻译结果
    await ctx.reply(`\`${getLangText('translate_result', motherLang)}:\``, { parse_mode: 'MarkdownV2' });
    await ctx.reply(`\`\`\`\n${result}\n\`\`\``, { parse_mode: 'MarkdownV2' });

    // 存储
    sessions[userId] = {
      text: text,       // 原始发来的文字
      result: result    // 翻译出来的结果
    };

    // 清理临时文件
    fs.unlinkSync(oggPath);
    fs.unlinkSync(outputTextPath);

    // 跳转到“创建音频”，create_audio 按钮
    await ctx.reply(getLangText('creating_audio', motherLang));
    const mp3Path = `./audio/${userId}.mp3`;
    const audioOggPath = `./audio/${userId}.ogg`;
    const voice = userConfig[userId].tts_voice || 'nova';
    const model = userConfig[userId].tts_model || 'tts-1-hd';
    await textToMp3(result, mp3Path, voice, model);
    mp3ToOgg(mp3Path, audioOggPath);

    // 构建“翻译成其他语言”按钮
    const buttons = [];
    if (userConfig[userId]?.otherlang && userConfig[userId].otherlang.length > 0) {
      userConfig[userId].otherlang.forEach((lang) => {
      buttons.push([{ text: getButtonText('translate_to', motherLang)(lang), callback_data: `translate_${lang}` }]);
      });
    }

    // 发送语音消息
    // 发送带按钮的消息，按钮会显示在语音消息下方
    if (buttons.length > 0) {
      await ctx.replyWithVoice({ source: audioOggPath }, {
      reply_markup: {
        inline_keyboard: buttons,
      }
      });
    }
    // 清理临时文件
    fs.unlinkSync(mp3Path);
    fs.unlinkSync(audioOggPath);

  } catch (error) {
    console.error('处理失败:', error);
    await ctx.reply('抱歉，处理语音消息时发生错误。');
  }
});


// 转语音
bot.action('create_audio', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userConfig = loadUserConfig();
    const motherLang = userConfig[userId]?.motherlang || 'English';
    await ctx.reply(getLangText('creating_audio', motherLang));
    const result = sessions[userId].result; // 获取会话中存储的翻译结果

    // 生成 mp3
    const mp3Path = `./audio/${userId}.mp3`;
    const oggPath = `./audio/${userId}.ogg`;
    const voice = userConfig[userId].tts_voice || 'nova'; // 使用用户配置的语音
    const model = userConfig[userId].tts_model || 'tts-1-hd'; // 使用用户配置的模型
    await textToMp3(result, mp3Path, voice, model);
    mp3ToOgg(mp3Path, oggPath);
    await ctx.replyWithVoice({ source: oggPath });
    // 清理临时文件
    fs.unlinkSync(mp3Path);
    fs.unlinkSync(oggPath);
  } catch (error) {
    console.error('Error in create_audio:', error);
    const userConfig = loadUserConfig();
    const motherLang = userConfig[userId]?.motherlang || 'English';
    await ctx.reply(getLangText('audio_error', motherLang));
  }
});
  

// 处理输入框翻译
bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query?.trim();
  if (!query) return;

  const userId = ctx.from.id;
  const userConfig = loadUserConfig();

  // 权限检查（仅白名单用户可用）
  if (!userConfig[userId]) {
    const noAccessText = [
      '❌ 你没有权限使用本机器人。',
      '❌ You do not have permission to use this bot.',
      '❌ У вас нет прав на использование этого бота.'
    ].join('\n');

    return ctx.answerInlineQuery([
      {
        type: 'article',
        id: 'no_permission',
        title: '🚫 权限不足',
        description: '请联系管理员添加白名单。',
        input_message_content: {
          message_text: noAccessText
        }
      }
    ], { cache_time: 0 });
  }


  const targetLang = userConfig[userId].targetlang;
  const motherLang = userConfig[userId].motherlang;
  const otherLang = userConfig[userId].otherlang;

  // 调用你的翻译函数
  const result = await translateWithGrok(query, targetLang, motherLang); 

  return ctx.answerInlineQuery([
    {
      type: 'article',
      id: '1',
      title: getLangText('translate_result', motherLang),
      description: result,
      input_message_content: {
        message_text: result
      }
    }
  ], {
    cache_time: 0 // 不缓存结果
  });
});



bot.launch();
console.log('🤖 Bot 启动成功');
