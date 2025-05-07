# Telegram Translator Bot

一个基于 Telegraf 的 Telegram 翻译机器人，支持多语言翻译，并通过 Docker 部署。

---

## 功能介绍

- 自动识别并翻译指定语言
- 多用户配置支持
- 接入第三方 AI 翻译 API
- Docker 一键部署，快速上线

---

## 部署教程
### 下载 docker-compose-tgbottranslator.yml
```
mkdir -p tgbot-translator && cd tgbot-translator && wget -O docker-compose-tgbottranslator.yml 'https://raw.githubusercontent.com/Venompool888/tgbot-translator/refs/heads/main/docker-compose-tgbottranslator.yml' && wget -O 'https://raw.githubusercontent.com/Venompool888/tgbot-translator/refs/heads/main/userConfig.json'
```
### 添加好相应环境变量 
![image](https://github.com/user-attachments/assets/1413c4e7-cbe2-43ee-9a38-f3c58f4e77d7)


### 编辑用户配置文件`userConfig.json`

用于配置不同用户的翻译偏好。示例：

```json
{
  "123456": {
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
