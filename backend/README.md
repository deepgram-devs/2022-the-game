### Running locally

Copy `.env.example` to `.env` and insert any missing credentials. Then run:

```bash
cd ../frontend
npm install && npm run build

cd ../backend
docker-compose up --build --force-recreate
```
