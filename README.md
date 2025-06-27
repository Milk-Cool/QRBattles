# QRBattles
QR-based card game

## Setup
Set up your .env as shown below:
```
POSTGRES_PASSWORD=RandomSecureString
COOKIE_SECRET=SecureRandomString
ADMIN_KEY=VeryRandomSecureString
```
Optionally, add:
```
DEMO_MODE=1  --  if you want to use the demo page
NODE_ENV=production  --  if you're deploying to prod
```

Then, run:
```sh
docker-compose up
```
to start the website. It will listen at port 5328.