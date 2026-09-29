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
# Files under /etc/nginx/templates are rendered with envsubst on start,
# which is how the listen port follows the injected ${PORT}.
COPY nginx.conf /etc/nginx/templates/app.conf.template

# nginx's envsubst only substitutes variables that exist as real
# environment variables and does not understand bash `${VAR:-default}`
# syntax, so the defaults live here rather than in the template.
#   compose -> 80 / backend:8000
#   Railway -> injected PORT / a BACKEND_URL you set
ENV PORT=80
ENV BACKEND_URL=backend:8000

EXPOSE 80

# Probe 127.0.0.1 rather than localhost: inside the container localhost
# resolves to ::1, but nginx binds IPv4 only, so a localhost probe
# fails with "connection refused" even though the site is fine.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --quiet --tries=1 --spider "http://127.0.0.1:${PORT}/" || exit 1

CMD ["nginx", "-g", "daemon off;"]
