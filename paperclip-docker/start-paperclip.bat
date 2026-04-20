@echo off
set PAPERCLIP_HOME=C:\Users\junio\.paperclip-docker-instance
set DATABASE_URL=postgresql://paperclip:paperclip@localhost:5433/paperclip
set BETTER_AUTH_SECRET=paperclip-dev-secret-32chars-here-ok
set PAPERCLIP_MIGRATION_AUTO_APPLY=true
cd C:\Users\junio\Downloads\Cortexiapwauiuxdesign\paperclip-src
pnpm dev
