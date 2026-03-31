# CuroSCM Production Operations

## Infrastructure

| Component | Location |
|-----------|----------|
| Frontend  | Vercel (curoscm.vercel.app) |
| Backend   | Hetzner CPX41 VM, Ashburn (shared with skysnags) |
| Database  | PostgreSQL 15 via Supabase (Docker on VM) |
| Auth      | Supabase GoTrue (Docker on VM) |
| Storage   | Supabase Storage (Docker on VM) |
| API GW    | Kong (Docker on VM) |
| HTTPS     | Caddy (shared with skysnags, auto TLS) |

### Port Allocation (shared VM)

| Service | Port | Project |
|---------|------|---------|
| PostgreSQL | 5432 | skysnags |
| PostgreSQL | 5433 | curoscm |
| Backend API | 8737 | skysnags |
| Supabase API (Kong) | 8443 | curoscm |
| Supabase Studio | 8444 | curoscm |
| Redis | 6379 | skysnags |

## SSH Access

```bash
ssh root@178.156.229.132
```

## Container Management

```bash
cd /opt/curoscm/app

# Status
docker ps --filter "name=curoscm-"

# Restart a single service
docker compose -f docker-compose.prod.yml restart curoscm-auth
docker compose -f docker-compose.prod.yml restart curoscm-rest
docker compose -f docker-compose.prod.yml restart curoscm-db

# Full rebuild and restart
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Stop everything
docker compose -f docker-compose.prod.yml down

# View resource usage
docker stats --no-stream --filter "name=curoscm-"
```

## Logs

### From local machine (remote tail via SSH)

```bash
# All CuroSCM container logs
ssh root@178.156.229.132 \
  'docker compose -f /opt/curoscm/app/docker-compose.prod.yml logs -f'

# Auth service logs (signups, logins)
ssh root@178.156.229.132 \
  'docker logs -f curoscm-auth 2>&1'

# PostgREST logs (API queries)
ssh root@178.156.229.132 \
  'docker logs -f curoscm-rest 2>&1'

# Database logs
ssh root@178.156.229.132 \
  'docker logs -f curoscm-db 2>&1 | grep -E "(ERROR|WARNING)"'

# Kong API gateway logs
ssh root@178.156.229.132 \
  'docker logs -f curoscm-kong 2>&1'
```

### From the VM (after SSH in)

```bash
# Individual services
docker logs -f curoscm-db
docker logs -f curoscm-auth
docker logs -f curoscm-rest
docker logs -f curoscm-kong
docker logs -f curoscm-realtime
docker logs -f curoscm-storage
docker logs -f curoscm-studio

# All services
docker compose -f /opt/curoscm/app/docker-compose.prod.yml logs -f
```

## Database Access

```bash
# Interactive psql shell
docker exec -it curoscm-db psql -U supabase_admin -d curoscm

# Quick query
docker exec -it curoscm-db psql -U supabase_admin -d curoscm -c "SELECT count(*) FROM auth.users;"
```

## Migrations

Migrations run automatically on deploy via GitHub Actions. To run manually:

```bash
cd /opt/curoscm/app
for f in supabase/migrations/*.sql; do
  echo "Applying $f..."
  docker exec -i curoscm-db psql -U supabase_admin -d curoscm < "$f"
done
```

## Health Checks

```bash
# Supabase API (via Kong)
curl http://localhost:8443/rest/v1/ -H "apikey: YOUR_ANON_KEY"

# Auth service directly
curl http://localhost:9999/health

# Database
docker exec curoscm-db pg_isready -U supabase_admin -h localhost

# All container health
docker ps --filter "name=curoscm-" --format "table {{.Names}}\t{{.Status}}"
```

## Database Queries

```bash
# Open interactive psql shell
docker exec -it curoscm-db psql -U supabase_admin -d curoscm
```

### User & Organization Data

```sql
-- Total users
SELECT count(*) FROM auth.users;

-- Recent signups
SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Organizations
SELECT id, name, slug, created_at FROM public.organizations;

-- Teams with member counts
SELECT t.name, t.id, count(tm.id) as members
FROM teams t
LEFT JOIN team_memberships tm ON tm.team_id = t.id
GROUP BY t.id ORDER BY t.name;

-- Users by organization
SELECT p.full_name, p.email, o.name as org, tm.role
FROM profiles p
JOIN team_memberships tm ON tm.user_id = p.id
JOIN organizations o ON o.id = tm.organization_id
ORDER BY o.name, p.full_name;
```

### Project & Procurement Data

```sql
-- Projects by status
SELECT status, count(*) FROM projects GROUP BY status;

-- Active projects with item counts
SELECT p.project_number, p.name, p.status,
  (SELECT count(*) FROM bom_items WHERE project_id = p.id) as bom_items,
  (SELECT count(*) FROM requisitions WHERE project_id = p.id) as requisitions,
  (SELECT count(*) FROM bids WHERE project_id = p.id) as bids
FROM projects p
ORDER BY p.created_at DESC;

-- BOM items by type
SELECT bom_type, count(*), sum(quantity * coalesce(unit_price, 0)) as total_value
FROM bom_items GROUP BY bom_type;

-- Requisition pipeline
SELECT status, count(*) FROM requisitions GROUP BY status;

-- Bid pipeline
SELECT status, count(*) FROM bids GROUP BY status;

-- Businesses by type
SELECT business_type, count(*) FROM businesses GROUP BY business_type;

-- Catalog items
SELECT count(*), count(*) FILTER (WHERE is_purchasable) as purchasable
FROM catalog_items;
```

### Activity & Tasks

```sql
-- Open tasks by entity
SELECT entity_type, status, count(*)
FROM tasks
GROUP BY entity_type, status
ORDER BY entity_type, status;

-- Recent notes
SELECT n.entity_type, n.entity_id, p.full_name, n.content, n.created_at
FROM notes n JOIN profiles p ON p.id = n.created_by
ORDER BY n.created_at DESC LIMIT 20;
```

## Supabase Studio

Access the admin dashboard (when domain is configured):
```
http://localhost:8444
```

Or via SSH tunnel:
```bash
ssh -L 8444:localhost:8444 root@178.156.229.132
# Then open http://localhost:8444 in your browser
```

## Initial Server Setup

Run this once on the VM to set up CuroSCM:

```bash
# Create directory
mkdir -p /opt/curoscm/app

# Clone repo
cd /opt/curoscm/app
git clone https://github.com/theorycraftbrands/curoSCM.git .

# Create env file from template
cp .env.production.example .env

# Generate secrets
echo "Generate these values and put them in .env:"
echo "POSTGRES_PASSWORD: $(openssl rand -base64 24)"
echo "JWT_SECRET: $(openssl rand -base64 32)"
echo ""
echo "Then generate ANON_KEY and SERVICE_ROLE_KEY from the JWT_SECRET"
echo "See: https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys"

# After editing .env, start services
docker compose -f docker-compose.prod.yml up -d

# Run migrations
for f in supabase/migrations/*.sql; do
  docker exec -i curoscm-db psql -U supabase_admin -d curoscm < "$f"
done
```

### Add Caddy reverse proxy (add to existing Caddyfile)

```
# Add this block to /etc/caddy/Caddyfile (when domain is ready)
api.curoscm.com {
    reverse_proxy localhost:8443
}
```

Then reload Caddy: `systemctl reload caddy`

## DNS Records (when domain is ready)

| Record | Type | Value |
|--------|------|-------|
| curoscm.com | CNAME | Vercel (auto) |
| api.curoscm.com | A | 178.156.229.132 |

## Deployment

Deployments are triggered automatically via GitHub Actions on push to `main` when backend files change (migrations, docker config). Manual trigger available via `workflow_dispatch` in the Actions tab.

Frontend deploys automatically via Vercel on every push to `main`.

### GitHub Secrets Required

- `CUROSCM_VM_HOST` — `178.156.229.132`
- `CUROSCM_VM_USER` — `root`
- `CUROSCM_VM_SSH_KEY` — SSH private key (same as skysnags)

### Vercel Environment Variables

Set these in the Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL` — `https://api.curoscm.com` (or VM IP for now)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your generated anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Your generated service role key
- `NEXT_PUBLIC_APP_URL` — `https://curoscm.vercel.app`
