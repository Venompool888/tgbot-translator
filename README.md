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

## 配置文件说明

项目根目录需要有一个 `userConfig.json`，用于配置不同用户的翻译偏好。示例：

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
