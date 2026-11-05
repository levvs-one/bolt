#!/bin/sh
# Установка Bolt на чистый сервер Linux: Docker, панель, база, Valkey и Caddy с HTTPS.
#   curl -fsSL https://raw.githubusercontent.com/levvs-one/bolt/main/install.sh | sh
# Подключение страницы подписки после выпуска API-токена в панели:
#   sh /opt/bolt/install.sh --subscription-token <токен>
set -eu

REPOSITORY_RAW="${BOLT_REPOSITORY_RAW:-https://raw.githubusercontent.com/levvs-one/bolt/main}"
INSTALL_DIR="${BOLT_DIR:-/opt/bolt}"
SECRET_BYTES=32

say() { printf '%s\n' "$*"; }
fail() { printf 'Ошибка: %s\n' "$*" >&2; exit 1; }

secret() { od -An -tx1 -N"$SECRET_BYTES" /dev/urandom | tr -d ' \n'; }

# Значение передаётся через окружение, а не через шаблон: спецсимволы в нём ничего не ломают.
set_env() {
    KEY="$1" VALUE="$2" awk '
        BEGIN { key = ENVIRON["KEY"]; value = ENVIRON["VALUE"] }
        index($0, key "=") == 1 { print key "=" value; found = 1; next }
        { print }
        END { if (!found) print key "=" value }
    ' .env > .env.next
    mv .env.next .env
    chmod 600 .env
}

# При запуске через curl | sh стандартный ввод занят скриптом, поэтому вопросы читаются из терминала.
ask() {
    printf '%s: ' "$1" > /dev/tty
    read -r answer < /dev/tty
    [ -n "$answer" ] || fail "$1 не может быть пустым"
    printf '%s' "$answer"
}

compose() { docker compose --project-directory "$INSTALL_DIR" "$@"; }

enable_subscription_page() {
    [ -f "$INSTALL_DIR/.env" ] || fail "Bolt ещё не установлен в $INSTALL_DIR"
    cd "$INSTALL_DIR"
    set_env SUBSCRIPTION_PAGE_API_TOKEN "$1"
    compose --profile subscription up -d
    say "Страница подписки запущена: https://$(sed -n 's/^SUBSCRIPTION_DOMAIN=//p' .env)"
}

if [ "${1:-}" = "--subscription-token" ]; then
    [ -n "${2:-}" ] || fail "после --subscription-token нужен токен"
    enable_subscription_page "$2"
    exit 0
fi

[ "$(id -u)" -eq 0 ] || fail "запустите от root"
command -v curl > /dev/null || fail "нужен curl"

if ! command -v docker > /dev/null; then
    say "Ставлю Docker..."
    curl -fsSL https://get.docker.com | sh
fi
docker compose version > /dev/null 2>&1 || fail "нужен Docker Compose v2"

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

for file in docker-compose.yml Caddyfile install.sh; do
    curl -fsSL "$REPOSITORY_RAW/$file" -o "$file"
done

if [ -f .env ]; then
    say "Нашёл $INSTALL_DIR/.env, оставляю как есть и обновляю контейнеры."
else
    curl -fsSL "$REPOSITORY_RAW/.env.example" -o .env
    chmod 600 .env

    panel_domain="${PANEL_DOMAIN:-$(ask 'Домен панели, например panel.example.com')}"
    subscription_domain="${SUBSCRIPTION_DOMAIN:-$(ask 'Домен подписок, например sub.example.com')}"
    database_password=$(secret)

    set_env PANEL_DOMAIN "$panel_domain"
    set_env FRONT_END_DOMAIN "$panel_domain"
    set_env SUBSCRIPTION_DOMAIN "$subscription_domain"
    set_env SUB_PUBLIC_DOMAIN "$subscription_domain"
    set_env APP_SECRET "$(secret)"
    set_env METRICS_PASS "$(secret)"
    set_env POSTGRES_PASSWORD "$database_password"
    set_env DATABASE_URL "postgresql://bolt:$database_password@bolt-db:5432/bolt"
    set_env SUBSCRIPTION_PAGE_JWT_SECRET "$(secret)"
fi

compose pull
compose up -d

panel_domain=$(sed -n 's/^PANEL_DOMAIN=//p' .env)
say ""
say "Bolt запущен: https://$panel_domain"
say "1. Откройте панель и создайте администратора."
say "2. В панели: Настройки, Токены API, создайте токен."
say "3. Запустите страницу подписки: sh $INSTALL_DIR/install.sh --subscription-token <токен>"
