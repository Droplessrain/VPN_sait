# Orbit VPN — лендинг

Статический сайт для тестирования на [Render](https://dashboard.render.com/).

Структура секций близка к [CloudVPN](https://cloudvpn.ai/ru/) (hero → зачем → возможности → устройства → тарифы → CTA), визуал — тёмный «orbit/space» под Android-клиент.

## Локально

```bash
cd /home/user/IdeaProjects/orbit-vpn-landing
npm start
# http://localhost:3000
```

Или просто открыть `index.html` в браузере.

## Деплой на Render (Static Site)

1. Залейте репозиторий на GitHub/GitLab (этот каталог — отдельный проект).
2. [dashboard.render.com](https://dashboard.render.com/) → **New** → **Static Site**.
3. Подключите репо.
4. Settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Deploy.

Либо используйте `render.yaml` (Blueprint).

## Перед продом

- Замените `hello@orbitvpn.example` на реальный email.
- В `main.js` или на странице задайте ссылку на APK:

```html
<script>window.ORBIT_APK_URL = "https://…/OrbitVPN-….apk";</script>
```

- Уточните тексты Privacy под юрлицо.
