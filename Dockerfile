from golang:1.25-alpine as backend-builder
workdir /app

copy ./backend/go.mod .
copy ./backend/go.sum .
run go mod download

copy ./backend .
run CGO_ENABLED=0 GOOS=linux go build -v -o ./app ./cmd/backend

from node:22-alpine as frontend-builder
run corepack enable
workdir /app

copy ./frontend/package.json .
copy ./frontend/pnpm-lock.yaml .
run pnpm install

copy ./frontend .
env VITE_SERVER_URL=""
run pnpm build

from scratch

workdir /app
copy --from=frontend-builder /app/dist ./dist
copy --from=backend-builder /app/app /bin/app

cmd ["/bin/app"]
