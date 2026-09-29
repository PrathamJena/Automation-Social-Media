# Deployment guide

Two ways to give someone a link they can open. Pick based on whether the
app needs to keep running when your laptop is switched off.

| | Cloud hosting | Cloudflare Tunnel |
| --- | --- | --- |
| **Link** | `yourapp.up.railway.app` | `random-name.trycloudflare.com` |
| **Permanent** | Yes | No — changes on restart |
| **Works with laptop off** | Yes | No |
| **Cost** | Free tier, then ~$5/mo | Free |
| **Setup** | Needs a hosting account | Needs Docker only |

**For showing a client, use cloud hosting.** The tunnel is useful for a
quick look, but it dies whenever Docker stops and the address changes.

---

## 1. The production build

Both Dockerfiles already build production images. To run the real thing
on your own machine first:

```bash
# Create the production environment file
cp .env.example .env.prod
```

At minimum set these in `.env.prod`:

```ini
APP_ENV=production
SECRET_KEY=<a long random string>
POSTGRES_PASSWORD=<a strong database password>
CORS_ORIGINS=http://localhost:8080
```

Generate a secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Then start it:

```bash
docker compose -f docker-compose.prod.yml up -d --build

# Create the first admin user
docker compose -f docker-compose.prod.yml exec backend \
  python -m app.scripts.seed_admin
```

The app is now on **http://localhost:8080** (a compiled nginx build, not
the dev server).

Stop it with:

```bash
docker compose -f docker-compose.prod.yml down
```

### What changes in production

| | Development | Production |
| --- | --- | --- |
| Frontend | Vite dev server, hot reload | Compiled static files served by nginx |
| Backend | `uvicorn --reload` | `uvicorn` without reload, runs as non-root |
| Migrations | Run by hand | Applied automatically on start |
| API calls | Vite proxy | nginx proxy, same origin |
| Host header | Any | Validated by nginx, not Vite |

Because the API is proxied on the same origin, there are no CORS errors
in production. If you host the frontend separately, set `CORS_ORIGINS` to
that exact origin.

---

## 2. Deploying to the cloud (recommended)

### Railway

1. Push the code to GitHub (see the main README).
2. Go to [railway.app](https://railway.app) and sign in with GitHub.
3. **New Project → Deploy from GitHub repo** → pick your repo.
4. Railway reads `docker-compose.prod.yml` automatically. If it does
   not, create the service manually:
   - **Add service → Docker image** or **Database → PostgreSQL**
5. In each service's **Variables** tab add:

   | Variable | Where |
   | --- | --- |
   | `SECRET_KEY` | backend, worker, beat |
   | `POSTGRES_PASSWORD` | all |
   | `DATABASE_URL` | backend, worker, beat — Railway gives you this value |
   | `REDIS_URL` | backend, worker, beat |
   | `APP_ENV` | `production` |

6. Click **Generate Domain** on the frontend service.

Your app is now at `https://yourapp.up.railway.app`.

**Note:** Railway's free tier sleeps services after inactivity, so the
first request after a quiet period can take ~30 seconds.

### Render

1. [render.com](https://render.com) → sign in with GitHub.
2. **New → Blueprint** → pick your repo. Render reads
   `render.yaml` if present; otherwise add a **Web Service** with the
   Dockerfile from `backend/`.
3. Add a **Postgres** database and a **Redis** instance.
4. Set the same variables as above.

Render gives `https://yourapp.onrender.com` and also sleeps on the free
tier.

### Before you share it

- [ ] `SECRET_KEY` is a long random value, not the placeholder
- [ ] `ADMIN_PASSWORD` is strong — change it from the UI under
      **Settings → Security**
- [ ] `CORS_ORIGINS` matches your real domain
- [ ] The database is not published to the internet

---

## 3. Quick tunnel (for a fast demo)

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose --profile tunnel up -d tunnel
docker compose logs tunnel | grep trycloudflare
```

The link dies when you stop the tunnel, and the address changes on every
restart. Use it for a quick look, not as a real site.

---

## Troubleshooting

**Blank white page in production**
The JavaScript bundle failed to load. Open the browser console (F12) and
check for errors. Usually a missing environment variable at build time.

**`/settings` returns 404 on refresh**
The SPA fallback is missing. Confirm `frontend/nginx.conf` has
`try_files $uri $uri/ /index.html;` in the `location /` block.

**`SECRET_KEY must be set`**
The backend refuses to start in production without it. Generate one and
add it to every service that needs it.

**Backend restarts repeatedly**
Check the logs with:
`docker compose -f docker-compose.prod.yml logs backend`

**Uploads fail with 413**
Raise `client_max_body_size` in `frontend/nginx.conf` and restart the
frontend.
