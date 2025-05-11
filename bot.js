require('dotenv').config();
const { Telegraf } = require('telegraf');
const { translateWithGrok, translateOtherLangWithGrok } = require('./translate');
const fs = require('fs');
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

  const result = await translateWithGrok(text, targetLang, motherLang);

  // 存储
  sessions[userId] = {
    text: text,       // 原始发来的文字
    result: result    // 翻译出来的结果
  };
  

  // 构建按钮
  const buttons = [];

  if (otherLang && otherLang.length > 0) {
    otherLang.forEach((lang, index) => {
      buttons.push([{ text: `Translate to ${lang}`, callback_data: `translate_${lang}` }]);
    });
  }

  await ctx.reply(`\`${result}\``, { parse_mode: 'MarkdownV2' ,
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
    
    const targetLang = ctx.match[1]; // 正则取出需要翻译的目标语言，比如 ja, fr, de
    const text = sessions[userId].text; // 获取会话中存储的原文
    const firstResult = sessions[userId].result; // 获取会话中存储的翻译结果
    

    if (!text) {
      return ctx.reply('⚠️ 没有找到原始翻译内容，请重新发送文本。');
    }

    const result = await translateOtherLangWithGrok(text, targetLang, firstResult);

    

    
    await ctx.reply(`\`${result}\``, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    console.error('Error in translate_otherlang:', error);
    await ctx.reply('⚠️ 翻译过程中出现错误，请稍后重试');
  }
});

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
      title: '翻译结果',
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
