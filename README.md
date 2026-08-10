# XKeen UI Controller

Одна панель для конфигов **Mihomo** на нескольких роутерах с **XKeen UI**. Один Global-черновик YAML, вкладки по роутерам, Save и soft-restart Mihomo.

## Возможности

- Флот роутеров: добавить/удалить по IPv4 (опционально имя); список в `DATA_DIR`
- Вкладки **Global** (общий draft) и по каждому роутеру
- YAML-редактор с валидацией
- **Save** пишет конфиг; **Apply** пишет и soft-restart Mihomo
- На Global: выбор целей (online/offline); на вкладке роутера: только он
- Utilities → Backup на выбранных роутерах
- Health-опрос XKeen (`/api/control`): online, running, текущий core
- Локали en/ru, тема light / dark / system

Запросы к роутерам идут на `http://{ip}:{XKEEN_UI_PORT}` (порт по умолчанию `1000`). Сервер с контейнером должен видеть IP роутеров в сети.

## Быстрый старт (Docker / OpenMediaVault)

Нужны Docker и Docker Compose. Образ публичный: на сервере логин в Docker Hub не нужен.

1. Скопируйте [`docker-compose.yml`](docker-compose.yml) на сервер.
2. При необходимости измените порт (`3000:3000`) и путь volume (`/config/xkeen-ui-controller` → свой каталог для данных).
3. Запустите:

```bash
docker compose pull
docker compose up -d
```

В OpenMediaVault: **Pull**, затем **Up**.

4. Откройте `http://<server>:3000`.

### Обновление

После публикации нового образа в Docker Hub:

```bash
docker compose pull
docker compose up -d
```

Или снова **Pull** → **Up** в OMV. Тег по умолчанию: `latest`. Чтобы зафиксировать сборку, укажите например `vchikalkin/xkeen-ui-controller:sha-abc1234`.

## Переменные окружения

| Переменная | По умолчанию | Назначение |
| --- | --- | --- |
| `DATA_DIR` | `./data` (в контейнере `/data`) | Каталог данных контроллера (`routers.json`, draft) |
| `MIHOMO_CONFIG_PATH` | `/opt/etc/mihomo/config.yaml` | Путь к конфигу Mihomo **на роутере** (как его видит XKeen) |
| `XKEEN_UI_PORT` | `1000` | Порт XKeen UI на роутерах |

## Локальная разработка

```bash
pnpm install
pnpm dev
```

Приложение: [http://localhost:3000](http://localhost:3000).

Собрать образ локально:

```bash
docker build -t xkeen-ui-controller .
```

## Публикация образа (CI)

GitHub Actions собирает образ и пушит в Docker Hub как `{DOCKERHUB_USERNAME}/xkeen-ui-controller` (`latest` и `sha-<short>`) при push в `master` или ручном `workflow_dispatch`.

Секреты репозитория (Settings → Secrets and variables → Actions):

- `DOCKERHUB_USERNAME`: логин Docker Hub
- `DOCKERHUB_TOKEN`: Access Token (Read & Write)

Сделайте репозиторий образа на Docker Hub **Public**, если коллеги должны тянуть без логина.
