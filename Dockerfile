FROM node:20.9.0-alpine
RUN addgroup app && adduser -S -G app app
RUN mkdir /app && chown app:app app
USER app


WORKDIR /app
COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "start"]
