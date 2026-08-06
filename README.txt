DİDİ SOSYAL BETA 1.1 — MODÜLER ÜRETİM TABANI

ÇALIŞTIRMA
1. Node.js 20 veya üzeri kurulu olmalı.
2. BASLAT.bat dosyasına çift tıklayın.
3. Tarayıcıda http://localhost:3000 adresini açın.

DEMO HESAPLARI
- Yönetici: mehmetsait / 1234
- DİDİ Haber: didihaber / 123456
- DİDİ Müzik: didimuzik / 123456
- Ayşe Demir: aysedemir / 123456

ÇALIŞAN MODÜLLER
- Güvenli sunucu tarafı üyelik ve giriş
- PBKDF2 şifre hashleme ve HttpOnly oturum çerezi
- Ortak gönderi, medya, beğeni, yorum ve kaydetme
- Takip sistemi
- Özel mesajlaşma ve okundu bilgisi
- Bildirimler
- Gruplar ve etkinlikler
- Kamera/mikrofon canlı yayın oda kaydı
- Şikâyet ve yönetim paneli
- SSE gerçek zamanlı güncelleme
- Atomik JSON veri kaydı ve yedekleme
- Render ve Docker dağıtım dosyaları
- PostgreSQL geçiş şeması

ÖNEMLİ SINIRLAR
- Bu paket çalışan ve modüler bir üretim tabanıdır; büyük ölçekli nihai sistem değildir.
- Çok katılımcılı gerçek WebRTC yayını için mediasoup, LiveKit veya benzeri bir SFU gerekir.
- Büyük video/fotoğraf depolaması için S3 uyumlu nesne depolama gerekir.
- E-posta doğrulama, şifre sıfırlama, web push ve ödeme sistemi harici servis ister.
- Varsayılan çalışma modu atomik JSON veritabanıdır. PostgreSQL şeması geçiş için database/schema.sql içindedir.


V12 EKLENENLER
- E-posta doğrulama token akışı
- Şifre sıfırlama token akışı
- Yeni hesaplarda en az 8 karakter şifre
- IP tabanlı temel hız sınırı
- Güvenlik olay kayıtları
- Gönderi sayfalama bilgisi
- Süresi dolan token ve oturum temizliği
- Kapalı beta kullanımına uygun doğrulama ekranları

NOT
Kapalı beta paketinde e-posta gönderme servisi bağlı olmadığı için doğrulama ve şifre sıfırlama tokenları ekranda gösterilir.
Üretimde SMTP/Resend/SendGrid benzeri bir e-posta servisi bağlanmalıdır.


BETA 1.1 ÇALIŞTIRMA
- Windows: BASLAT.bat
- Komut satırı: npm start
- Adres: http://localhost:3000

BAKIM MODU
MAINTENANCE_MODE=true ortam değişkeniyle bakım ekranı açılır.

SİSTEM DURUMU
Uygulama içindeki Sistem Durumu menüsünden API ve sürüm durumu görülebilir.


BETA 1.1 YENİLİKLERİ
- Boş port otomatik bulunur (3000-3010).
- Tarayıcı otomatik olarak localhost adresinde açılır.
- 0.0.0.0 adresinin tarayıcı adresi olmadığı açıkça gösterilir.
- Node.js kurulum kontrolü eklendi.
- BASLAT.bat bulunduğu klasörden doğru şekilde çalışır.
- DURDUR.bat ile kullanılan DİDİ portları kapatılabilir.
- KONTROL.bat kod ve port durumunu gösterir.

DOĞRU KULLANIM
1. ZIP dosyasını tamamen çıkartın.
2. BASLAT.bat dosyasına çift tıklayın.
3. Tarayıcı otomatik açılır.
4. Elle açmak gerekirse konsolda yazan http://localhost:PORT adresini kullanın.
5. http://0.0.0.0:PORT adresini tarayıcıya yazmayın.


YÖNETİCİ GİRİŞİ DÜZELTMESİ
Kullanıcı adı: İlk çalıştırmada belirlenir (önerilen: didiadmin)
Şifre: İlk çalıştırmada gizli olarak belirlenir.

Eski veri nedeniyle giriş kabul edilmezse:
1. Sunucuyu DURDUR.bat ile kapatın.
2. ADMIN_SIFRE_ONAR.bat dosyasını çalıştırın.
3. BASLAT.bat dosyasını yeniden açın.
4. Tarayıcıda Ctrl+Shift+Delete ile localhost çerezlerini temizleyin veya gizli pencere kullanın.


YENİ YÖNETİCİ HESABI
Kullanıcı adı: İlk çalıştırmada belirlenir (önerilen: didiadmin)
Şifre: İlk çalıştırmada gizli olarak belirlenir.

Eski yönetici hesabı `mehmetsait` otomatik olarak `didiadmin` adına dönüştürülür.
Giriş sorunu yaşanırsa ADMIN_SIFRE_ONAR.bat dosyasını çalıştırın.


BETA 1.1.3 KESİN BAŞLATMA
1. ZIP dosyasını tamamen çıkartın.
2. Eski açık sürümü DURDUR.bat ile kapatın.
3. BASLAT.bat dosyasına çift tıklayın.
4. BASLAT.bat yönetici hesabını otomatik onarır.
5. 3000 doluysa 3001-3010 arasında boş port otomatik seçilir.
6. PowerShell'de daha önce ayarlanmış PORT değeri doluysa yok sayılır.
7. Tarayıcı otomatik olarak doğru localhost adresinde açılır.

YÖNETİCİ
Kullanıcı adı: İlk çalıştırmada belirlenir (önerilen: didiadmin)
Şifre: İlk çalıştırmada gizli olarak belirlenir.


BETA 1.2 YENİLİKLERİ
- Profil adı ve biyografi düzenleme
- Uygulama içinden güvenli şifre değiştirme
- Güvenlik olay geçmişi
- Bildirimleri topluca okundu yapma
- Bildirimleri tek tek silme
- Yönetici panelinden mavi tik verme/kaldırma
- Yönetici panelinden kullanıcı rolü değiştirme
- Şikâyetleri kapatma
- Önceki otomatik port ve gömülü yönetici düzeltmeleri korunur
