# ---- build stage -------------------------------------------------------
# Compile the app into static files that any web server can serve.
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first so Docker can cache them independently of
# the source code.
COPY package*.json ./
RUN npm ci

COPY . .

# Vite bakes the API base URL in at build time. The default keeps API
# calls same-origin, which is what the bundled nginx config proxies.
ARG VITE_API_URL=''
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- runtime stage -----------------------------------------------------
# Only the compiled output and a web server. No node_modules, no
# source, no dev server - a much smaller and safer image.
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/app.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
