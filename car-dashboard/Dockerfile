FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
ARG WS_URL
ENV WS_URL=${WS_URL}
RUN npm run build:css \
  && node ./node_modules/typescript/bin/tsc \
  && node ./node_modules/parcel/lib/bin.js build src/index.html --dist-dir dist --public-url / \
  && mkdir -p dist/frontend/assets \
  && cp -R src/frontend/assets/images dist/frontend/assets/

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80