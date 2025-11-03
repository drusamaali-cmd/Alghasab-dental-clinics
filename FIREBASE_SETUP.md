# 🔔 دليل تفعيل الإشعارات الفورية (Push Notifications)

## المشكلة الحالية

حالياً، الإشعارات تظهر فقط داخل التطبيق عند فتحه. لا تصل إشعارات فورية للمراجع.

## الحل: Firebase Cloud Messaging (FCM)

لتفعيل الإشعارات الفورية، نحتاج إعداد Firebase.

---

## 📋 خطوات الإعداد

### 1️⃣ إنشاء مشروع Firebase

**أ. اذهب إلى Firebase Console:**
```
https://console.firebase.google.com/
```

**ب. أنشئ مشروع جديد:**
1. اضغط "Add project" أو "إضافة مشروع"
2. اسم المشروع: `alghasab-clinic`
3. اضغط "Continue" ثم "Create project"

---

### 2️⃣ إضافة تطبيق الويب

**في مشروع Firebase:**

1. اضغط على أيقونة **"</>** (Web)
2. اسم التطبيق: `Alghasab Clinic App`
3. اضغط "Register app"
4. **احفظ** معلومات Firebase Config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "alghasab-clinic.firebaseapp.com",
  projectId: "alghasab-clinic",
  storageBucket: "alghasab-clinic.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### 3️⃣ تفعيل Cloud Messaging

1. في قائمة Firebase، اذهب إلى **"Cloud Messaging"**
2. اضغط على تبويب **"Web configuration"**
3. اضغط **"Generate key pair"**
4. **احفظ** الـ VAPID key:
```
VAPID Key: BNdJ...
```

---

### 4️⃣ تحديث ملفات التطبيق

**أ. ملف `/app/frontend/src/firebase.js`:**

افتح الملف وغيّر:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ضع apiKey من الخطوة 2
  authDomain: "YOUR_AUTH_DOMAIN",   // ضع authDomain
  projectId: "YOUR_PROJECT_ID",     // ضع projectId
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

وأيضاً:
```javascript
const token = await getToken(messaging, {
  vapidKey: 'YOUR_VAPID_KEY'  // ضع VAPID key من الخطوة 3
});
```

**ب. ملف `/app/frontend/public/firebase-messaging-sw.js`:**

نفس التحديثات لـ firebaseConfig.

---

### 5️⃣ طلب إذن الإشعارات

**تحديث PatientDashboard.js:**

الكود جاهز! عند فتح المراجع للتطبيق أول مرة، سيُطلب منه السماح بالإشعارات.

---

### 6️⃣ إرسال إشعارات من Backend

**تحديث Backend:**

```python
# في server.py
import firebase_admin
from firebase_admin import credentials, messaging

# Initialize Firebase Admin
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

async def send_push_notification(fcm_token: str, title: str, body: str, data: dict = None):
    """Send push notification via Firebase"""
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data or {},
        token=fcm_token,
    )
    
    try:
        response = messaging.send(message)
        print(f'Successfully sent message: {response}')
        return True
    except Exception as e:
        print(f'Error sending message: {e}')
        return False
```

---

## 🔑 الحصول على Service Account Key

**لربط Backend بـ Firebase:**

1. في Firebase Console → **Project Settings** (⚙️)
2. تبويب **"Service accounts"**
3. اضغط **"Generate new private key"**
4. سيتم تنزيل ملف JSON
5. ضع الملف في `/app/backend/firebase-key.json`
6. **لا تشارك هذا الملف أبداً!**

---

## ✅ اختبار الإشعارات

### من Firebase Console (اختبار سريع):

1. اذهب إلى **Cloud Messaging**
2. اضغط **"Send your first message"**
3. املأ:
   - العنوان: "تجربة إشعار"
   - النص: "مرحباً من عيادات الغصاب"
4. اختر **"Send test message"**
5. الصق FCM Token من المتصفح Console
6. اضغط **"Test"**

### من لوحة التحكم:

بعد الإعداد الكامل:
1. سجل دخول على لوحة الإدارة
2. اذهب لتبويب "الحملات"
3. أرسل عرض جديد
4. **يجب أن يصل فوراً للمراجعين!** 🎉

---

## 🔍 التحقق من عمل الإشعارات

**في متصفح المراجع:**

1. افتح Console (F12)
2. ابحث عن:
```
FCM Token: ...
```
3. إذا ظهر، الإعداد نجح!

---

## 🚨 مشاكل شائعة وحلولها

### المشكلة 1: "Permission denied"
**الحل:** المراجع لم يوافق على الإشعارات. اطلب منه:
- في المتصفح → الإعدادات → الخصوصية → الإشعارات
- السماح للموقع بإرسال إشعارات

### المشكلة 2: "No FCM token"
**الحل:** تأكد من:
- تحديث firebase.js بالبيانات الصحيحة
- VAPID key صحيح
- HTTPS مفعل (ضروري!)

### المشكلة 3: الإشعارات لا تظهر
**الحل:** تحقق من:
- Service Worker مسجل بنجاح
- FCM token محفوظ في قاعدة البيانات
- Backend يرسل للـ token الصحيح

---

## 📱 ملاحظات مهمة

### HTTPS مطلوب
Push Notifications تعمل فقط على HTTPS (ليس HTTP).
✅ التطبيق الحالي يستخدم HTTPS

### دعم المتصفحات
- ✅ Chrome
- ✅ Firefox  
- ✅ Edge
- ✅ Safari (iOS 16.4+)
- ❌ Samsung Internet (قد يحتاج إعدادات خاصة)

### التكلفة
Firebase مجاني حتى:
- 10,000 رسالة/يوم
- كافٍ لمعظم العيادات

---

## 🎯 الوضع بعد التفعيل

**قبل التفعيل:**
❌ المراجع يفتح التطبيق → يشوف الإشعارات

**بعد التفعيل:**
✅ يوصل الإشعار فوراً حتى لو التطبيق مغلق
✅ صوت تنبيه
✅ يظهر على شاشة القفل
✅ المراجع يضغط → يفتح التطبيق مباشرة

---

## 📞 تحتاج مساعدة؟

إذا واجهتك صعوبة في الإعداد:

**الخيار 1: إعداد مبسط**
احتفظ بالنظام الحالي (إشعارات داخل التطبيق فقط)

**الخيار 2: إعداد كامل**
اتبع الدليل أعلاه خطوة بخطوة

**الخيار 3: دعم فني**
تواصل مع مطور متخصص في Firebase

---

## ✅ الحل المؤقت (بدون Firebase)

**يمكنك الآن استخدام:**
- ✅ الإشعارات داخل التطبيق (تعمل)
- ✅ زر "احجز الآن" في كل إشعار (جديد)
- ✅ WhatsApp أو SMS للعروض المهمة

**مستقبلاً:**
- ✅ تفعيل Firebase للإشعارات الفورية

---

**آخر تحديث:** نوفمبر 2025
