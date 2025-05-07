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
### ⬇️下载 docker-compose-tgbottranslator.yml
```
mkdir -p tgbot-translator && cd tgbot-translator && wget -O docker-compose-tgbottranslator.yml 'https://raw.githubusercontent.com/Venompool888/tgbot-translator/refs/heads/main/docker-compose-tgbottranslator.yml' && wget -O 'https://raw.githubusercontent.com/Venompool888/tgbot-translator/refs/heads/main/userConfig.json'
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

