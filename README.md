# Orbit VPN — лендинг

Статический маркетинговый сайт (hero, фичи, тариф Free, Privacy, Terms, кнопка скачивания APK).  
Репозиторий: `git@github.com:Droplessrain/VPN_sait.git`  
Ветка: `master`  
Прод: Render Static Site (см. `render.yaml`).

## Структура

| Файл | Назначение |
|------|------------|
| `index.html` | Главная |
| `privacy.html` / `terms.html` | Политика и условия |
| `styles.css` / `main.js` | Стили и ссылка на APK |
| `_headers` | Заголовки для Render |
| `dist/` | Артефакт сборки (`npm run build`) — то, что публикует Render |

Ссылка на APK задаётся и в `main.js` (`apkUrl`), и в `index.html` (`#apk-link href`), чтобы не ломался кэш.

## Локально поднять

```bash
cd /home/user/IdeaProjects/orbit-vpn-landing
npm start
# http://localhost:3000
```

Или открыть `index.html` в браузере (без сервера).

Сборка как на Render:

```bash
npm run build
# результат в dist/
```

## Запушить изменения

```bash
cd /home/user/IdeaProjects/orbit-vpn-landing
git status
git add index.html main.js privacy.html terms.html styles.css dist/ render.yaml _headers
git commit -m "Кратко: зачем изменение"
git push origin master
```

После push Render обычно деплоит сам. Если сайт не обновился:  
[dashboard.render.com](https://dashboard.render.com/) → сервис лендинга → **Manual Deploy** → Deploy latest commit.

## Обновить ссылку на APK

1. Положить новый APK в репо `vpn_releases` (см. README там) и запушить.
2. В этом репо заменить версию в двух местах:

```bash
# пример: 1.0.9 → 1.0.11
grep -n 'OrbitVPN-' main.js index.html dist/main.js dist/index.html
```

URL вида:

`https://raw.githubusercontent.com/Droplessrain/vpn_releases/main/releases/OrbitVPN-X.Y.Z-client-release.apk`

3. Commit + push `master` → дождаться Render (или Manual Deploy).

## Первый деплой на Render

1. GitHub: репо `Droplessrain/VPN_sait` уже есть.
2. Render → **New** → **Static Site** → подключить репо.
3. Settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Или Blueprint: `render.yaml`.

## Перед продом / чеклист

- [ ] Реальный contact email (сейчас в приложении; на сайте — по необходимости)
- [ ] Актуальная ссылка на APK в `main.js` + `index.html` (+ `dist/`)
- [ ] Privacy / Terms согласованы с клиентом (реклама Yandex, OAuth, soft-delete)
- [ ] После push — сайт открывается и кнопка «Скачать APK» ведёт на нужный файл
