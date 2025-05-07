# 用体积更小的 Node 镜像
FROM node:20-slim

# 设置工作目录
WORKDIR /app

# 只复制必要文件（减少缓存层体积）
COPY package.json package-lock.json ./

# 安装生产依赖（如果没有用 devDependencies 可以不用 --production）
RUN npm install --production

# 复制剩下所有源码
COPY . .

# 启动 bot
CMD ["node", "bot.js"]
