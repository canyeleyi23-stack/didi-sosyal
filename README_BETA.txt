DİDİ SOSYAL BETA — RENDER TAM PAKET

Bu ZIP tam site kodunu içerir.

GitHub depo kökünde şu yapı görünmelidir:
server.js
package.json
render.yaml
public/
  index.html
  assets/

Render ayarları:
Language: Node
Root Directory: boş
Build Command: npm install
Start Command: node server.js
Health Check Path: /api/health

Kurulum:
1. ZIP'i bilgisayarda tamamen çıkartın.
2. GitHub'a ZIP dosyasını değil, içindeki tüm dosya ve klasörleri yükleyin.
3. Commit changes yapın.
4. Render'da Manual Deploy > Clear build cache & deploy seçin.

Bu sürümde ana sayfa server.js içine yedekli gömülüdür.
public/index.html eksik yüklenmiş olsa bile ana sayfa açılır.
