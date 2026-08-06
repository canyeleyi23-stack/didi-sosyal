# DİDİ Sosyal Beta 1.3

- Açılışta DİDİ logo/splash ekranı geri eklendi.
- Yönetici şifresi giriş ekranından, konsoldan ve belgelerden kaldırıldı.
- Kaynak kodda sabit yönetici şifresi tutulmaz.
- İlk çalıştırmada PowerShell güvenli giriş alanıyla yönetici şifresi belirlenir.
- Şifre yalnızca PBKDF2 hash biçiminde veritabanında saklanır.
- ADMIN_SIFRE_DEGISTIR.bat eklendi.
- Otomatik port seçimi ve tarayıcı açılışı korundu.
