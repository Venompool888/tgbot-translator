# Telegram Translator Bot

一个基于 Telegraf 的 Telegram 翻译机器人，支持多语言翻译，并通过 Docker 部署。

---

## 功能介绍

- 🌍 自动识别并翻译指定语言
- 👥 多用户配置支持
- 🤖 使用AI翻译，翻译结果更加精准，接地气
- 🐳 Docker 一键部署，快速上线

---

## 👨‍🎓部署教程
### 准备内容
- Telegram Bot Token（[✈️ 如何获得 telegram-bot-token？](https://github.com/Venompool888/CloudflareDNS-TGBot/tree/main?tab=readme-ov-file#%EF%B8%8F-%E5%A6%82%E4%BD%95%E8%8E%B7%E5%BE%97-telegram-bot-token)）
- AI API （符合OpenAI接口规范标准的理论上都可以，[🤖🔩支持的 AI API 平台](https://github.com/Venompool888/tgbot-translator/blob/main/README.md#%E6%94%AF%E6%8C%81%E7%9A%84-ai-api-%E5%B9%B3%E5%8F%B0-%E8%BF%99%E9%83%A8%E5%88%86%E5%86%85%E5%AE%B9%E5%AE%8C%E5%85%A8%E7%94%B1-gpt-%E7%94%9F%E6%88%90-%E7%9B%AE%E5%89%8D%E5%8F%AA%E6%B5%8B%E8%AF%95%E4%BA%86-openai-%E4%BB%A5%E5%8F%8A-grok)）
### ⬇️下载 docker-compose-tgbottranslator.yml
下面的命令会在你的文件夹（一般是 `root`）下创建一个名为`tgbot-translator`的📂文件夹，并且在里面存放`docker-compose-tgbottranslator.yml`以及`userConfig.json`:
```
mkdir -p tgbot-translator && cd tgbot-translator && wget -O docker-compose-tgbottranslator.yml 'https://raw.githubusercontent.com/Venompool888/tgbot-translator/refs/heads/main/docker-compose-tgbottranslator.yml' && wget -O userConfig.json 'https://raw.githubusercontent.com/Venompool888/tgbot-translator/refs/heads/main/userConfig.json'
```
### ✨添加好相应环境变量
![image](https://github.com/user-attachments/assets/1413c4e7-cbe2-43ee-9a38-f3c58f4e77d7)


### ✏️编辑用户配置文件 `userConfig.json`

用于配置不同用户的翻译偏好。示例：

```json
{
  "tg_user_id": {
    "name":"ikun",
    "targetlang": "English",
    "motherlang": "简体中文",
    "otherlang": "俄语"
  },
  "123456789": {
    "targetlang": "English",
    "motherlang": "俄语",
    "otherlang": "中文"
  }
}
```
- **tg_user_id**: [👤 如何获得 telegram-user-id？](https://github.com/Venompool888/CloudflareDNS-TGBot/tree/main#-%E5%A6%82%E4%BD%95%E8%8E%B7%E5%BE%97-telegram-user-id)
- **name**: 用户的名字，对程序没有实际影响，不需要的话，这一行可以完全不写。仅仅作为查阅配置文件时，方便知道是谁
- **motherlang**: 用户的母语
- **targetlang**: 机器人默认翻译的目标语言，所有非母语的消息将被翻译为此语言。
- **otherlang**: 用户可能需要的第三语言

### 启动🐳Docker
```
docker compose -f docker-compose-tgbottranslator.yml up -d



```
## 🌟 效果展示
![image](https://github.com/user-attachments/assets/a4046640-4bea-4f5f-b104-fc5fde6a3a40)


## 🤖🔩支持的 AI API 平台 (这部分内容完全由 GPT 生成, 目前只测试了 OpenAI 以及 Grok)

当前项目支持以下兼容 OpenAI Chat Completions 标准接口的 AI 平台：

| 平台 | 是否支持 | 备注 | Endpoint 地址 |
|:-----|:--------|:-----|:--------------|
| [OpenAI](https://platform.openai.com/) | ✅ | 完全兼容，直接替换 API Key 和 Endpoint | https://api.openai.com/v1/chat/completions |
| [Grok](https://console.x.ai/) | ✅ | 完全兼容，推荐使用 | https://api.groq.com/openai/v1/chat/completions 或 https://api.x.ai/v1/chat/completions |
| [Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/) | ✅ | 兼容，需要配置部署名和API版本 | https://<your-resource-name>.openai.azure.com/openai/deployments/<deployment-name>/chat/completions?api-version=2023-12-01-preview |
| [Moonshot AI](https://platform.moonshot.cn/) | ✅ | 完全兼容 OpenAI API 标准 | https://api.moonshot.cn/v1/chat/completions |
| [Perplexity API](https://www.perplexity.ai/) | ✅ | 开启 OpenAI兼容模式即可 | (视服务商代理，通常是 OpenAI 标准接口) |
| [Mistral Hosted API](https://mistral.ai/) | ✅ | HuggingFace 等代理，兼容 OpenAI 标准格式 | 通常自建或代理提供 OpenAI 兼容 endpoint |
| [Anthropic Claude](https://www.anthropic.com/) (中转后) | ✅ | 经 OpenAI 兼容 proxy 可用 | 取决于中转平台提供的 Endpoint |

---

## 部分支持或需适配的平台

| 平台 | 是否支持 | 备注 | Endpoint 地址 |
|:-----|:--------|:-----|:--------------|
| Gemini (Google AI) | ⚠️ | 原生接口不兼容，需要适配 | https://generativelanguage.googleapis.com/v1beta/models/*:generateContent |
| Kimi 智谱清言 | ⚠️ | 不兼容 OpenAI标准，需要单独适配 | https://api.minimax.chat/v1/text/chatcompletion |

---

## 暂不支持的平台

| 平台 | 是否支持 | 备注 | Endpoint 地址 |
|:-----|:--------|:-----|:--------------|
| 文心一言（百度） | ❌ | 完全不同接口，不兼容 | https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions |
| 通义千问（阿里） | ❌ | 完全不同接口，不兼容 | https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation |


