# CodeBloom – A Beginner-Friendly Coding Gateway

## 🧠 Problem Statement
Many individuals, especially children and young adults, are interested in learning to code but struggle to find age-appropriate, structured resources. While platforms like Grasshopper and FreeCodeCamp exist, there’s no centralized platform that recommends courses and resources tailored to users' age and coding proficiency.

## 🌱 Solution
**CodeBloom** is a centralized, beginner-friendly platform that recommends curated, free coding resources based on the user's age and experience level. It provides a user-friendly interface to guide learners through age-appropriate content, offers learning progress tracking, and integrates popular learning platforms like Grasshopper, FreeCodeCamp, and YouTube.

---

## ⚙️ Technical Analysis

### Frontend (React)
- Responsive pages for signup and login.
- Forms to collect age group and coding proficiency.
- Dashboard to display recommended resources.

### Backend (Node.js/Express with Clerk for Authentication)
- User authentication with role-based access (beginner, intermediate, advanced).
- RESTful APIs for retrieving personalized learning paths.
- Secure user management with JWT and optional third-party auth (e.g., Google).

### Database (MongoDB)
- Stores user profiles, activity history, preferences, and progress.
- Enables analytics and personalized recommendations.

### Integration
- External links to learning platforms like Grasshopper, FreeCodeCamp, and YouTube.
- Authentication via Clerk with JWT for secure sessions.

---

## 🌟 Core Features

### 1. User Management
- Sign up/login with role and age detection.
- Personalized dashboard showing recommended paths and progress.
  
### 2. Personalized Recommendations
- Curated tutorials, platforms, and resources based on age and skill.
- Age-specific routing (e.g., Scratch for kids, FreeCodeCamp for adults).

### 3. Gamification
- Badges for milestones (e.g., "First Lesson Completed").
- Learning streaks and goal tracking to boost engagement.

### 4. Community Support (Future Scope)
- Forums for asking beginner questions.
- Resource sharing and peer feedback.

---

## 🛠️ Development Phases

| Timeline   | Tasks |
|------------|-------|
| **Week 1–2** | Plan user workflows, wireframes; build frontend static pages |
| **Week 3–4** | Setup backend, MongoDB schemas, authentication, and APIs |
| **Week 5**   | Develop recommendation logic and resource integration |
| **Week 6**   | Add gamification features and run unit tests |
| **Week 7–8** | Finalize UI/UX, optimize, deploy with Docker on cloud |

---

## 🧒 Recommended Platforms by Age Group

### 👶 Ages 6–10
- [Code.org] – Interactive, beginner activities
- [Scratch (MIT)] – Block-based creative programming
- [Blockly] – Customizable drag-and-drop interface

### 👧 Ages 10–16
- [Khan Academy – Programming] – Interactive coding tutorials
- [CodeCombat] – Learn to code through game challenges
- [p5.js] – Creative coding for interactive visual projects

### 👨 Ages 18+
- [FreeCodeCamp] – Full-stack curriculum and certifications
- [The Odin Project] – Full-stack open-source learning path
- [Open-EdX] – Free and open courseware for developers
- [CS50 (Harvard)] – Comprehensive introduction to computer science

---

## 🚀 Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Authentication**: Clerk, JWT
- **Database**: MongoDB
- **Deployment**: Docker, Cloud Hosting (e.g., Render, Vercel, or Heroku)

---

## 💡 Future Enhancements
- Community forums for discussion and peer support.
- Mobile-friendly version or companion app.
- Advanced analytics to recommend next learning steps more intelligently.

---

## FrontEnd deplyment link :- https://s62-gowrish-capstone-code-bloom.vercel.app/



