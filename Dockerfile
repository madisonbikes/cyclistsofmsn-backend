FROM node:14
ENV NODE_ENV=production
RUN npm install --global npm@8.1.1
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent --production=false
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
