FROM node:18-alpine as build

# Create app directory
WORKDIR /app

COPY  . .

RUN yarn install --production
RUN yarn prisma generate
RUN yarn build

EXPOSE 80
# Start the server using the production build
CMD [ "node", "dist/main.js" ]
