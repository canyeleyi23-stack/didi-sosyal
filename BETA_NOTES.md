# DİDİ Sosyal Beta 1.0 Kullanım Notları

Bu sürüm kapalı beta içindir.

## Çalışan temel akışlar

- Üyelik ve giriş
- E-posta doğrulama tokenı
- Şifre sıfırlama tokenı
- Gönderi, beğeni, yorum, kaydetme
- Takip
- Mesajlaşma
- Gruplar
- Etkinlikler
- Canlı yayın odası
- Bildirimler
- Yönetim ve güvenlik kayıtları

## Bilinen sınırlar

- E-posta tokenları ekranda gösterilir; gerçek e-posta servisi bağlı değildir.
- Büyük medya için S3 veya benzeri nesne depolama gerekir.
- Canlı yayın, medya sunucusu yerine oda ve kamera önizlemesi düzeyindedir.
- Varsayılan veri katmanı atomik JSON dosyasıdır.
- PostgreSQL şeması geçiş hazırlığı olarak pakete dahildir.
