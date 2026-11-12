FROM node:20-alpine

WORKDIR /app

# 只拷运行所需文件，绝不把 .env 打进镜像
COPY package.json ./
COPY server.js ./
COPY lib ./lib
COPY public ./public
COPY scripts ./scripts
COPY README.md ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# .env 由 compose 的 env_file 注入；--env-file-if-exists 让本地也能直接跑
CMD ["node", "--env-file-if-exists=.env", "server.js"]
