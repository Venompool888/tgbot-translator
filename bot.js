const { Telegraf } = require('telegraf');
const { translateWithGrok, translateOtherLangWithGrok } = require('./translate');
const fs = require('fs');

const sessions = {}; // 存储会话数据

const bot = new Telegraf('删除中文换成你的bot token'); // 替换为你的Bot Token

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
  
  // 存储翻译结果到会话
  sessions[userId] = result;

  await ctx.reply(`${result}`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: `Translate to ${otherLang}`, callback_data: `translate_otherlang` }]
      ]
    }
  });
});

// 翻译成其他语言
bot.action('translate_otherlang', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const userConfig = loadUserConfig();
    
    if (!userConfig[userId]) {
      return ctx.reply('❌ 你没有权限使用本机器人。\n❌ You do not have permission to use this bot.\n❌ У вас нет прав на использование этого бота.');
    }

    // 获取原始消息文本
    const message = ctx.callbackQuery.message;
    if (!message || !message.text) {
      return ctx.reply('⚠️ 无法获取原始消息');
    }

    const text = message.text.split('\n')[0]; // 获取第一行文本
    const otherLang = userConfig[userId].otherlang;

    if (!otherLang) {
      return ctx.reply('请先使用 /set-default-lang 设置目标语言');
    }

    const result = await translateOtherLangWithGrok(text, otherLang);

    // 存储翻译结果到会话
    sessions[userId] = result;

    
    await ctx.reply(`${result}`);
  } catch (error) {
    console.error('Error in translate_otherlang:', error);
    await ctx.reply('⚠️ 翻译过程中出现错误，请稍后重试');
  }
});

// 复制翻译结果
bot.action('copy', async (ctx) => {
  const userId = ctx.from.id;
  await ctx.answerCbQuery();

  const result = sessions[userId];
  if (!result) {
    return ctx.reply('⚠️ 没有可复制的翻译结果。请先发送文本进行翻译。');
  }

  await ctx.reply(`📋 以下是你要复制的翻译内容：\n\n${result}`);
});


bot.launch();
console.log('🤖 Bot 启动成功');
