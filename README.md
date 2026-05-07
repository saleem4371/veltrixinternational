# Veltrix International FZE — Phase 2
## Production Website & CMS

---

## 📁 Project Structure

```
veltrix-phase2/
├── server.js              ← Express backend (single entry point)
├── package.json
├── .env.example           ← Copy to .env and configure
├── data/
│   └── content.json       ← All website content (auto-created)
├── public/
│   ├── index.html         ← Public-facing website
│   ├── admin.html         ← CMS admin panel (/admin)
│   └── uploads/           ← Uploaded logos & images (auto-created)
└── README.md
```

---

## 🚀 Quick Start (Local / VPS)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Then edit `.env` with your values (see Configuration below).

### 3. Generate admin password hash
```bash
npm run hash YourChosenPassword
```
Copy the output hash into `ADMIN_PASSWORD_HASH` in your `.env` file.

### 4. Generate JWT secret
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Copy the output into `JWT_SECRET` in your `.env` file.

### 5. Start the server
```bash
npm start
```

The site will be running at:
- **Website:** `http://localhost:3000`
- **Admin:**   `http://localhost:3000/admin`

Default dev password (when `ADMIN_PASSWORD_HASH` is not set): `Veltrix@2025`

---

## ⚙️ Configuration (.env)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `production` or `development` |
| `JWT_SECRET` | Strong random string for JWT signing (min 32 chars) |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of your admin password (cost 12) |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_SECURE` | `true` for port 465, `false` for 587 |
| `SMTP_USER` | SMTP username / email address |
| `SMTP_PASS` | SMTP password or app password |
| `CONTACT_RECIPIENT` | Where contact form emails are sent (e.g. `hello@veltrix.ae`) |
| `CONTACT_FROM` | From address for outgoing emails |

---

## 📧 Email Setup (Contact Form)

### Gmail (recommended)
1. Enable 2-factor authentication on your Google account
2. Go to Google Account → Security → App passwords
3. Generate an app password for "Mail"
4. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your@gmail.com
   SMTP_PASS=your_app_password_here
   ```

> **Note:** If SMTP is not configured, form submissions are logged to the server console.

---

## 🌐 Deploying to a VPS (Ubuntu/Debian)

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PM2 (process manager)
```bash
sudo npm install -g pm2
```

### Deploy
```bash
# Upload files to server, then:
cd /var/www/veltrix
npm install --production
cp .env.example .env
# Edit .env with your values
pm2 start server.js --name veltrix
pm2 save
pm2 startup
```

### Nginx reverse proxy (optional, for port 80/443)
```nginx
server {
    server_name veltrix.ae www.veltrix.ae;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    # Upload size limit
    client_max_body_size 10M;
}
```

### SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d veltrix.ae -d www.veltrix.ae
```

---

## 🔑 Changing the Admin Password

1. Run: `npm run hash YourNewPassword`
2. Copy the output hash
3. Update `ADMIN_PASSWORD_HASH` in your `.env` file
4. Restart the server: `pm2 restart veltrix`

---

## 📂 Content & Uploads

- **Content** is stored in `data/content.json` — back this up regularly
- **Uploaded images** are stored in `public/uploads/` — back this up too
- The admin panel at `/admin` handles all content editing

---

## 🔒 Security Notes

- Never commit `.env` to version control (it's in `.gitignore`)
- Set `NODE_ENV=production` in production
- Use a strong `JWT_SECRET` (48+ random bytes)
- Use bcrypt cost 12 for the admin password hash
- Keep Node.js and dependencies updated

---

**Veltrix International FZE** · Dubai, UAE  
Built with ❤️ — Phase 2 Production Release
