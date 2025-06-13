const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

// 从环境变量读取 TTS API KEY 和 ENDPOINT
require('dotenv').config(); // 加载 .env 文件

const TTS_API_KEY = process.env.TTS_API_KEY;
const TTS_API_ENDPOINT = process.env.TTS_API_ENDPOINT;
const TTS_VOICE = process.env.TTS_VOICE || 'nova'; // 默认语音
const TTS_MODEL = process.env.TTS_MODEL || 'tts-1-hd'; // 默认模型

async function textToMp3(text, outputFile, voice, model) {
  // voice 和 model 由调用方（如 bot.js）传入，若未传则用默认值
  voice = voice || TTS_VOICE;
  model = model || TTS_MODEL;
  // 自动创建输出目录
  const dir = path.dirname(outputFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  try {
    const response = await axios.post(TTS_API_ENDPOINT, {
      model,
      input: text,
      voice,
      response_format: 'mp3'
    }, {
      headers: {
        'Authorization': `Bearer ${TTS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });
    fs.writeFileSync(outputFile, response.data);
    return outputFile;
  } catch (err) {
    console.error('TTS错误:', err.message);
    throw new Error('❌ 语音生成失败，请稍后再试。');
  }
}

// mp3 转 ogg 文件，返回 ogg 文件路径
function mp3ToOgg(mp3File, oggFile) {
  try {
    execSync(`${ffmpegPath} -y -i ${mp3File} -c:a libopus ${oggFile}`);
    return oggFile;
  } catch (ffmpegErr) {
    console.error('ffmpeg 转换失败:', ffmpegErr.message);
    throw new Error('❌ 语音 OGG 转换失败。');
  }
}

module.exports = {
  textToMp3,
  mp3ToOgg
};
