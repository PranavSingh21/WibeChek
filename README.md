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
| Home | Create custom vibes (emoji + text) | Must-have |
| Home | Availability toggle (Available/Busy) | Wont-have |
| Home | Group Dropdowns containing vibe cards | Must-have |
| Home | Edit menu for vibe cards | Should-have |
| Home | Group Dropdowns containing vibe cards | Must-have |
| Home | Google Map abiltiy for venue field in Vibe cards | could-have |
| Home | Notification toggle for vibe cards | could-have |
| Settings | Create new group (Group name input + Create) | Must-have |
| Settings | Join existing group (Group code input + Join) | Must-have |
| Settings | List of user’s groups with member count & shareable group codes | Must-have |
| Settings | Sign Out | Must-have |
| Settings | Edit Group Details Menu | Should-have |
| Settings | Leave Group | Could-have |
| Settings | Group Members Details | Could-have |
| Settings | Group Notifications toggle | Could-have |
| Messaging | Direct messages between friends (future) | Won’t-have (v1) |
| Friends | List of all users with live status | Won’t-have (v1) |
| Friends | Filter by shared vibes (future) | Won’t-have (v1) |

---

## 👥 User Journey  

1. **Login** – Fast Google sign-in, frictionless onboarding.  
2. **Home** – Browse or create vibes for your different groups; see all details with how many friends are "in" for each vibe.  
3. **Image/Name** – Edit you name and profile image quickly by one click. 
4. **Settings Menu Page** – Quickly create/ join groups and see all of your groups, with sign out option.  

---

## 📝 Research & Design  

- Conducted **wireframing and clickable prototypes** to test flows with early users.  
- Used **MoSCoW prioritization** to decide MVP features vs. backlog.  
- Applied a **mobile-first design system**: bright gradients, emoji-first UI, and touch-friendly interactions based on feedback.
<img width="250" height="600" alt="screen" src="https://github.com/user-attachments/assets/406b3d67-1964-48c1-8298-add01aa4c5d5" /> <img width="250" height="900" alt="screen" src="https://github.com/user-attachments/assets/bc23949a-67f1-4afa-aad0-d8b45f104d00" /> <img width="250" height="600" alt="screen" src="https://github.com/user-attachments/assets/1d0b7599-3f27-4c0b-b0db-5ab83fd34f3f" /> 

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
Future enhancements planned for WibeChek:

- Filter friends by shared vibes  
- Direct messaging  
- Notifications of vibe changes  
- Improved analytics dashboard  

---

## 🌐 Live Demo & Code  

- **Live site**: [https://wibe-chek.vercel.app/login)
- **GitHub repo**: [https://github.com/PranavSingh21/WibeChek](https://github.com/PranavSingh21/WibeChek)  

---

© 2025 Pranav Anand Singh
