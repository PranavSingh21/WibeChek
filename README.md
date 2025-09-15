# WibeChek – Real-Time Friend Activity App  

**WibeChek** is an MVP social-presence app that lets friends instantly share their current “vibe” (mood or activity) with one another.  
It was conceived, scoped, and delivered as a rapid experiment to validate whether lightweight, real-time status sharing increases social connection.

---

## 🎯 Product Vision  

Give people a simple, joyful way to broadcast what they’re up to and see what their friends are doing — instantly and without the clutter of traditional social feeds.

---

## 🗂️ MVP Scope  

| Area | Feature (MVP) | MoSCoW Priority |
|------|---------------|-----------------|
| Authentication | Google sign-in via Firebase Auth | Must-have |
| Home | Real-time vibe grid showing friend counts | Must-have |
| Home | Create custom vibes (emoji + text) | Should-have |
| Home | Availability toggle (Available/Busy) | Could-have |
| Settings | Create new group (Group name input + Create) | Must-have |
| Settings | Join existing group (Group code input + Join) | Must-have |
| Settings | List of user’s groups with member count & codes | Must-have |
| Settings | Sign Out | Must-have |
| Messaging | Direct messages between friends (future) | Won’t-have (v1) |
| Friends | List of all users with live status | Won’t-have (v1) |
| Friends | Filter by shared vibes (future) | Won’t-have (v1) |

---

## 👥 User Journey  

1. **Login** – Fast Google sign-in, frictionless onboarding.  
2. **Home** – Browse or create vibes; see how many friends are in each vibe.  
3. **Toggle Status** – Quickly set yourself Available/Busy.  
4. **Friends Page** – View all friends’ live availability; future filter & messaging planned.  

---

## 📝 Research & Design  

- Conducted **wireframing and clickable prototypes** to test flows with early users.  
- Used **MoSCoW prioritization** to decide MVP features vs. backlog.  
- Applied a **mobile-first design system**: bright gradients, emoji-first UI, and touch-friendly interactions based on feedback.  

---

## 📊 Success Criteria  

- <30-second onboarding (login + first vibe).  
- Real-time updates under 1 second.  
- ≥80% of testers rated UI as “fun” or “joyful.”  

---

## ⚙️ Tech Stack  

React (Vite) • TypeScript • Firebase Auth • Cloud Firestore • Tailwind CSS  

> This repo contains only the lightweight implementation needed to validate the MVP.  
> Developer setup: `npm install` → `npm run dev` (see `src/firebase/config.ts` for configuration).

---

## 🚀 Roadmap  

- Filter friends by shared vibes  
- Direct messaging  
- Notifications of vibe changes  
- Improved analytics dashboard  

---

## 🌐 Live Demo & Code  

- **Live site**: [https://your-live-site-link.com](https://your-live-site-link.com)  
- **GitHub repo**: [https://github.com/PranavSingh21/WibeChek](https://github.com/PranavSingh21/WibeChek)  

---

© 2025 Pranav Anand Singh
