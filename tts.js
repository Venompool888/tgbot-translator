function TTS(text, outputFile) {
  const axios = require('axios');
  const fs = require('fs');

  const apiKey = process.env.TTS_API_KEY; // 从环境变量中获取 API 密钥
  const voice = process.env.TTS_VOICE;  // 从环境变量中获取语音选项
  const model = process.env.TTS_MODEL; // 从环境变量中获取模型选项

  return axios.post('https://api.openai.com/v1/audio/speech', {
    model: model,
    input: text,
    voice: voice,
    response_format: 'mp3'
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    responseType: 'arraybuffer'
  }).then(response => {
    fs.writeFileSync(outputFile, response.data);
    console.log('音频已保存为', outputFile);
  }).catch(error => {
    console.error('调用TTS出错:', error.response ? error.response.data : error.message);
  });
}

// 示例调用
// TTS('需要转换为语音的文本', 'openai_output.mp3');
