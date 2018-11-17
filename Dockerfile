FROM dialonce/node:lts-carbon

WORKDIR /app
COPY . /app
RUN npm i --production

CMD ["node", "src/index.js"]
