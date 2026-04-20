$env:PAPERCLIP_HOME = "C:\Users\junio\.paperclip-docker-instance"
$env:DATABASE_URL = "postgresql://paperclip:paperclip@localhost:5433/paperclip"
$env:BETTER_AUTH_SECRET = "paperclip-dev-secret-32chars-here-ok"
$env:PAPERCLIP_MIGRATION_AUTO_APPLY = "true"
Set-Location "C:\Users\junio\Downloads\Cortexiapwauiuxdesign\paperclip-src"
& pnpm dev
