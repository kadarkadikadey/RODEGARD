# RoadGuard 🚗🛡️

[cite_start]**RoadGuard** is a smart, location-aware roadside assistance platform designed to connect stranded vehicle owners with nearby mechanics or towing services in real-time[cite: 18]. [cite_start]This project aims to reduce response times during vehicle breakdowns, especially in remote or hazardous areas[cite: 18, 28].

---

## 🚀 Key Features

### 👤 End User
- **OTP Authentication:** Secure login using role-based redirection[cite: 48, 98].
- **Workshop Discovery:** View nearby workshops in List, Card, or Map views[cite: 48, 100].
- **Service Requests:** Submit requests with vehicle details, issue descriptions, photos, and live GPS location[cite: 50, 104].
- **Live Tracking:** Real-time tracking of assigned mechanics with ETA display[cite: 51, 107].
- **Secure Payments:** Integrated digital payment system for service completion[cite: 27, 158].

### 🛠️ Worker / Mechanic
- **Service Updates:** View assigned tasks and update status (Started, In Progress, Completed)[cite: 53, 130].
- **Live Navigation:** Use integrated maps to navigate directly to the user's location[cite: 132].
- **Performance Tracking:** Access personal service history and performance logs[cite: 134].

### 🔑 Admin
- **Central Dashboard:** Monitor total, pending, and completed service requests in real-time[cite: 113, 114].
- **Worker Management:** Manage workshop and worker registrations and manual assignments[cite: 118, 122].
- **Analytics:** Access detailed logs and history for system accountability[cite: 124, 187].

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (React framework)[cite: 70].
- **Backend:** Node.js / Next.js API Routes[cite: 72].
- **Database:** FireBase
- **Authentication:** OTP-based secure verification[cite: 78, 189].
- **APIs & Integration:**
  - **Maps:** Google Maps API for real-time tracking[cite: 32, 157].
  - **Payments:** Razorpay Payment Gateway[cite: 34, 158].
  - **Communications:** Twilio (SMS) & WhatsApp API[cite: 36, 162].

---

## 📋 System Requirements (Non-functional)

- **Performance:** System processes requests within 3-5 seconds[cite: 170].
- **Scalability:** Supports up to 1000 concurrent users[cite: 173].
- **Reliability:** 99% uptime for 24/7 availability[cite: 196, 197].
- **Security:** SSL/TLS encrypted data transmission and PCI-DSS compliant payments[cite: 166, 192].

---

## 📂 Project Structure (Next.js)

```text
├── app/                # Next.js App Router
│   ├── (auth)/         # OTP & Registration routes
│   ├── (dashboard)/    # User, Admin, and Worker dashboards
│   └── api/            # RESTful API endpoints
├── components/         # Reusable UI components (Map, Cards, etc.)
├── lib/                # Third-party API configs (Razorpay, Google Maps)
├── public/             # Static assets (images, icons)
└── styles/             # Global CSS and Tailwind configs
```
--

## Prototype Working

https://github.com/user-attachments/assets/f4817b5c-87e4-496e-b542-b5fd26e953ae

