// 加载 .env 文件中的环境变量
require('dotenv').config();

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

/**
 * 使用 ffmpeg 将 OGG 文件转换为 MP3 格式
 * @param {string} inputPath - 输入的 OGG 文件路径
 * @param {string} outputPath - 输出的 MP3 文件路径
 * @returns {Promise<void>} - 转换完成的 Promise
 */
function convertOggToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `"${ffmpegPath}" -i "${inputPath}" -codec:a libmp3lame "${outputPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`转换失败: ${stderr}`);
        reject(error);
      } else {
        console.log(`转换成功: ${stdout}`);
        resolve();
      }
    });
  });
}

/**
 * 将 OGG 文件转换为 MP3，发送到 OpenAI 进行 STT，并将结果保存到文本文件
 * @param {string} oggPath - 输入的 OGG 文件路径
 * @param {string} outputTextPath - 输出的文本文件路径
 * @returns {Promise<void>} - 处理完成的 Promise
 */
async function processOggToText(oggPath, outputTextPath) {
  let mp3Path;
  try {
    // 检查文件是否存在
    if (!fs.existsSync(oggPath)) {
      throw new Error(`文件不存在: ${oggPath}`);
    }
    console.log(`OGG 文件路径: ${oggPath}`);

    // 转换 OGG 文件为 MP3
    mp3Path = oggPath.replace(/\.ogg$/, '.mp3');
    await convertOggToMp3(oggPath, mp3Path);

    console.log(`MP3 文件路径: ${mp3Path}`);

    // 准备发送到 OpenAI 的请求
    const formData = new FormData();
    formData.append('file', fs.createReadStream(mp3Path));
    formData.append('model', 'whisper-1'); // 使用 OpenAI Whisper 模型

    console.log('正在发送请求到 OpenAI STT API...');
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.STT_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    // 获取 STT 结果
    const text = response.data.text;
    console.log('STT 转录结果:', text);

    // 将结果保存到文本文件
    fs.writeFileSync(outputTextPath, text, 'utf8');
    console.log(`文本已保存到: ${outputTextPath}`);
  } catch (error) {
    console.error('处理失败:', error);
    throw error; // 重新抛出错误以便调用方处理
  } finally {
    // 清理临时 MP3 文件
    if (mp3Path && fs.existsSync(mp3Path)) {
      fs.unlinkSync(mp3Path);
      console.log(`临时文件已清理: ${mp3Path}`);
    }
  }
}


module.exports = { convertOggToMp3, processOggToText };


