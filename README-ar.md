[English](./README.md) | [العربية](./README-ar.md)
----
# إعداد وكيل عكسي محلي كامل لـ `fonts.gstatic.com` باستخدام IIS على نظام ويندوز

> **ملاحظة:** في اليمن، حظر مزود الخدمة الرئيسي **يمن نت**  نطاق `fonts.gstatic.com`، وهذا السبب الرئيسي الذي استدعى إنشاء هذا المستودع!.

يوفر هذا الإعداد **وكيلًا عكسيًا محليًا باستخدام HTTPS** لتجاوز الحظر من خلال إعادة توجيه الطلبات إلى خادم بديل (مثل Vercel) عبر جهازك المحلي.

بعد الانتهاء من هذه الخطوات، ستتمكن من زيارة:

[https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2](https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2)

وسيتم جلب المحتوى من الخادم الخلفي البديل (مثل Vercel) من خلال IIS المحلي لديك.

---

## 1. فتح IIS Manager
افتح **إدارة خدمات معلومات الإنترنت (IIS)** على نظام ويندوز.

---

## 2. تثبيت الوحدات المطلوبة
قم بتثبيت الإضافات التالية لـ IIS (عن طريق Web Platform Installer أو يدويًا):

- **URL Rewrite**
- **Application Request Routing (ARR)**

---

## 3. تفعيل خاصية الوكيل في ARR
1. في IIS Manager، اختر **عقدة الخادم** (وليس موقعًا محددًا).  
2. افتح **Application Request Routing Cache**.  
3. من الجزء الأيمن، انقر على **Server Proxy Settings**.  
4. فعّل خيار **Enable Proxy** ثم اضغط **Apply**.

---

## 4. إنشاء موقع محلي
1. في IIS Manager، انقر بزر الفأرة الأيمن على **Sites → Add Website**.  
2. أدخل البيانات التالية:
   - **Type:** `http`
   - **Host name:** `fonts.gstatic.com`
   - **Port:** `80`
   - **Physical path:** أي مجلد فارغ (مثل `C:\inetpub\fonts-proxy`)

---

## 5. تعديل ملف hosts
افتح الملف التالي:

```
C:\Windows\System32\drivers\etc\hosts
```

وأضف السطر:

```
127.0.0.1   fonts.gstatic.com
```

يعمل هذا على إعادة توجيه `fonts.gstatic.com` إلى خادم IIS المحلي لديك.

---

## 6. إنشاء شهادة SSL محلية
افتح **PowerShell** كمسؤول ثم نفذ:

```powershell
New-SelfSignedCertificate -DnsName "fonts.gstatic.com" -CertStoreLocation "cert:\LocalMachine\My"
```

---

## 7. تفعيل HTTPS للموقع

1. عد إلى **Bindings** للموقع الذي أنشأته.  
2. أضف ربطًا جديدًا:
   - **Type:** `https`
   - **Host name:** `fonts.gstatic.com`
   - **Port:** `443`
   - **SSL certificate:** اختر الشهادة التي أنشأتها للتو.  
3. اضغط **OK**.

---

## 8. إضافة قاعدة Reverse Proxy

1. حدد الموقع الجديد في IIS.  
2. افتح **URL Rewrite**.  
3. اضغط **Add Rule(s)…** → اختر **Reverse Proxy**.  
4. في خانة الوجهة (Inbound Proxy Destination)، أدخل:

```
v0-reverse-proxy-for-google-fonts.vercel.app
```

5. احفظ القاعدة.

---

## 9. تثبيت الشهادة في النظام

1. شغّل `certmgr.msc`.  
2. انتقل إلى **Personal → Certificates**.  
3. انسخ شهادة `fonts.gstatic.com`.  
4. الصقها في **Trusted Root Certification Authorities → Certificates**.

---

## 10. استيراد الشهادة في متصفح Chrome

حتى بعد الوثوق بالشهادة في النظام، قد يُظهر Chrome تحذيرًا بأن الاتصال غير آمن. لحل ذلك:

1. افتح `https://fonts.gstatic.com` في Chrome.  
2. انقر على أيقونة **غير آمن** → اعرض تفاصيل الشهادة.  
3. صدّر الشهادة إلى سطح المكتب.  
4. افتح `chrome://certificate-manager/localcerts/usercerts`.  
5. استورد الشهادة المصدّرة إلى **الشهادات الموثوق بها**.

---

## 11. الاختبار

زر الرابط التالي:

```
https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2
```

يجب أن تمر الطلبات عبر **الوكيل العكسي المحلي في IIS**، والذي بدوره يجلب الملفات من `v0-reverse-proxy-for-google-fonts.vercel.app`.

---

## ✅ النتيجة

- يتم اعتراض جميع طلبات `fonts.gstatic.com` محليًا.  
- يدعم HTTPS باستخدام شهادة موقعة ذاتيًا.  
- يمكن للمتصفحات الوثوق بالشهادة بعد استيرادها.  
- يمكنك استخدام موقع المرآة محليًا دون تعديل روابط الخطوط في HTML أو CSS.

---

للحصول على تعليمات مفصلة حول إعداد موقع المرآة، راجع [ملف البناء](BUILD.md).
