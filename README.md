# Decibel-114: Firebase + motion + 3D

এটা React (Vite) দিয়ে বানানো স্টোর। ডাটাবেস আর লগইন চলে Firebase-এ, ছবি থাকে Cloudinary-তে, আর সাইট হোস্ট হয় Vercel-এ। আলাদা কোনো backend সার্ভার লাগে না।

Firebase কী ছাড়া চালালে (`npm run dev`) সাইট **ডেমো মোডে** চলে। তখন স্যাম্পল ডাটা ব্রাউজারেই সেভ থাকে। অ্যাডমিন লগইন: `admin@decibel114.demo` / `admin123`।

---

## ১. লোকালি চালানো

```bash
npm install
npm run dev        # http://localhost:5173
```

## ২. Firebase প্রজেক্ট খোলা (SPORTY-র থেকে আলাদা)

Firebase-এর ফ্রি লিমিট **প্রতিটা প্রজেক্ট ধরে আলাদা**। তাই Decibel-114-এর জন্য নতুন প্রজেক্ট খুললে SPORTY-র কোটায় কোনো টান পড়বে না। একই গুগল অ্যাকাউন্ট ব্যবহার করলেও সমস্যা নেই।

1. https://console.firebase.google.com → **Add project** → নাম দিন `decibel-114`. Spark (ফ্রি) প্ল্যানেই থাকুন।
2. **Build → Authentication → Get started** → Sign-in method-এ **Email/Password** আর **Google** চালু করুন।
3. **Build → Firestore Database → Create database** → লোকেশন `asia-south1` (Mumbai), production mode।
4. **Firestore → Rules**: এই ফোল্ডারের `firestore.rules` ফাইলের পুরো লেখা পেস্ট করে **Publish** দিন।
5. **Project settings → General → Your apps → Web (</>)** → অ্যাপ রেজিস্টার করুন, তারপর config-এর মানগুলো কপি করুন।
6. `.env.example` কপি করে `.env` নামে সেভ করুন, তারপর `VITE_FIREBASE_*` ঘরগুলো পূরণ করুন।

## ৩. প্রথম অ্যাডমিন বানানো

1. সাইটে গিয়ে নিজের ইমেইল দিয়ে **Create account** করুন।
2. Firebase console → Firestore → `users` → আপনার ডকুমেন্ট খুলুন → `role` ফিল্ডের মান `customer` থেকে **`admin`** করে দিন।
3. পেজ রিফ্রেশ দিলেই `/admin` খুলবে। এরপর **Overview → Load starter catalog** চাপলে ১০টা ক্যাটাগরি আর ২১টা প্রোডাক্ট চলে আসবে। পরে দাম আর ছবি নিজের মতো বদলে নিন।

## ৪. অন্যদের অ্যাকাউন্ট বানিয়ে দেওয়া

**Admin → Customers & staff → Create account**-এ নাম, ইমেইল, ফোন আর রোল (Customer / Dealer / Staff / Admin) দিন। সিস্টেম একটা অস্থায়ী পাসওয়ার্ড বানিয়ে দেখাবে, যেটা এক ক্লিকে WhatsApp-এ পাঠানো যায়। ইউজার প্রথমবার লগইন করলে নিজের পাসওয়ার্ড সেট করতে বলা হবে। একই পেজ থেকে রোল বদলানো, পাসওয়ার্ড রিসেট লিংক পাঠানো আর অ্যাকাউন্ট Disable করা যায়।

## ৫. প্রোডাক্টের ছবি (Cloudinary, ফ্রি)

Firebase Storage এখন Blaze (কার্ড) প্ল্যান ছাড়া চলে না, তাই ছবি রাখা হয় Cloudinary-তে।

1. https://cloudinary.com-এ ফ্রি অ্যাকাউন্ট খুলুন।
2. **Settings → Upload → Upload presets → Add** → Signing mode **Unsigned** করে সেভ দিন।
3. `.env`-এ `VITE_CLOUDINARY_CLOUD` (cloud name) আর `VITE_CLOUDINARY_PRESET` (preset name) বসান।

ছবি না দিলে প্রোডাক্টের ধরন অনুযায়ী (রাউটার, সুইচ, AP…) বিল্ট-ইন ইলাস্ট্রেশন দেখাবে। চাইলে যেকোনো ছবির লিংকও পেস্ট করা যায়।

## ৬. Vercel-এ ডিপ্লয়

1. এই ফোল্ডারটা GitHub-এ পুশ করুন (`.env` পুশ হবে না)।
2. Vercel → **Add New Project** → repo সিলেক্ট করুন। Framework: **Vite**।
3. **Environment Variables**-এ `.env`-এর সবগুলো লাইন যোগ করুন (ফোন, WhatsApp, bKash নম্বরসহ) → **Deploy**।
4. Firebase → Authentication → Settings → **Authorized domains**-এ আপনার Vercel ডোমেইন যোগ করুন, নাহলে Google লগইন চলবে না।

## ফ্রি কোটা কীভাবে বাঁচানো হয়েছে

- প্রোডাক্ট লিস্ট ব্রাউজারে ১০ মিনিট ক্যাশ থাকে, আর Firestore-এর লোকাল ক্যাশ চালু। তাই একজন ভিজিটর বারবার পেজ বদলালেও প্রতিবার read খরচ হয় না।
- দিনে ৫০,০০০ read-এর ফ্রি লিমিট আছে। ২০০ প্রোডাক্ট থাকলে একজন নতুন ভিজিটর মোটামুটি ২১০ read খরচ করে, অর্থাৎ দিনে প্রায় ২৩০ জন নতুন ভিজিটর। ট্রাফিক এর বেশি হলে Blaze-এ গেলেও খরচ খুব কম (১ লাখ read-এ প্রায় $0.03)।
- অর্ডার ট্র্যাকিংয়ের জন্য আলাদা ছোট `tracking` ডকুমেন্ট আছে, তাই কাস্টমার শুধু স্ট্যাটাস দেখতে পায়, ঠিকানা বা ফোন নম্বর না।

## ফোল্ডার ম্যাপ

```
src/lib/db.js          সব ডাটা আর লগইন (Firestore + ডেমো মোড)
src/lib/demoData.js    স্টার্টার ক্যাটাগরি আর প্রোডাক্ট
src/three/HeroRack.jsx হিরো সেকশনের 3D র‍্যাক
src/components/        Navbar, ProductCard, DeviceArt (প্রোডাক্ট ইলাস্ট্রেশন), QuoteForm
src/pages/             স্টোরের পেজগুলো
src/pages/admin/       অ্যাডমিন প্যানেল
firestore.rules        নিরাপত্তা নিয়ম (Firebase console-এ পেস্ট করবেন)
```
