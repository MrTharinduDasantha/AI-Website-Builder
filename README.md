# AI Website Builder

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Framework-Express.js-black?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Better Auth](https://img.shields.io/badge/Auth-Better_Auth-000000)](https://better-auth.com/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-008CDD?logo=stripe)](https://stripe.com/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-000000?logo=vercel)](https://vercel.com/)

AI Website Builder is an advanced, full-stack application that leverages artificial intelligence to generate fully functional, creative single-page websites from simple text prompts. Users can watch their site being built in real-time, interact with an AI assistant to make iterative changes, or manually adjust colors and text. The platform features a robust credit system, Stripe payment integration for tier upgrades, and a vibrant community showcase for generated projects.

---

## 🚀 Demo

Click the link below to see the demonstration of the AI Website Builder.

Link 👉 https://drive.google.com/file/d/19hfjJY7abd9RY9LTXgXM5uvCwuUobD7I/view?usp=sharing 👈

---

## ✨ Features

| Category | Features |
|----------|----------|
| **Authentication** | Sign up, sign in, account settings (change name/email/password, delete account) via [Better Auth](https://better-auth.com/) |
| **Free Credits** | New users receive **20 free credits** upon registration |
| **AI Website Generation** | Enter a prompt ➡️ AI enhances it ➡️ builds a complete website (takes arount 5 minutes due to free AI model) |
| **Real‑time Preview** | View the generated site in the right sidebar as it is being built |
| **AI Assistant Chat** | Sidebar chat shows the enhanced prompt and allows AI‑powered modification requests |
| **Manual Edits** | Change colors, text, or any element manually after generation |
| **Version Rollback** | Revert to a previous version if a change does not meet expectations |
| **Responsive Preview** | Toggle between desktop, tablet, and mobile views |
| **Credit System** | Generating a website costs **5 credits**, AI‑assisted changes also cost credits |
| **Subscription Plans** | Basic ($5 – 100 credits), Pro ($19 – 400 credits), Enterprise ($49 – 1000 credits) via Stripe |
| **Project Management** | View all your projects in “My Projects”, download code, publish/unpublish, or delete a project |
| **Community Gallery** | Published projects appear on the Community page – visible to everyone (even non‑logged‑in users) |
| **Download** | Download the generated website’s full code |
| **Payments** | Secure payment processing with Stripe (checkout session & webhook) |

---

## 🛠️ Technologies Used

### Frontend (Client)
- **React (Vite)** – Fast, modern frontend framework
- **TypeScript** – Type‑safe code
- **Tailwind CSS** – Utility‑first styling
- **React Router DOM:** For seamless page navigation.
- **Axios:** For handling API requests to the backend.
- **React Hot Toast:** For elegant success and error notifications.

### Backend (Server) & Database
- **Node.js & Express.js:** Scalable backend runtime and framework.
- **PostgreSQL (Neon):** Serverless, highly scalable relational database.
- **Prisma ORM:** Modern database toolkit to query, migrate, and model data.
- **Better Auth** – Authentication & session management
- **Stripe** – Payment gateway & subscription handling

### AI & External Services
- **OpenRouter** – Provides the free AI model `arcee-ai/trinity-large-preview:free` for prompt enhancement and website generation
- **Vercel** – Hosting for both client and server (separate deployments)

---

## ⚙️ Installation & Setup

Clone the repository and navigate to project folder to install dependencies.
```bash
  git clone https://github.com/MrTharinduDasantha/AI-Website-Builder.git
  cd AI-Website-Builder
```

**1. Server Setup (Backend)**
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```
**Database Setup (Neon & Prisma):**
Sync your Prisma schema with your Neon PostgreSQL database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```
**Environment Variables**
Before running the app, configure the .env files in the server folder with following environment variables.
```bash
PORT=3000

# CORS trusted origins (Use your client's local or deployed URL)
TRUSTED_ORIGINS="http://localhost:5173" 

# PostgreSQL Database URL (from Neon)
DATABASE_URL="Enter your PostgreSQL database url"

# BetterAuth setup
BETTER_AUTH_SECRET="Enter a random secure string"
BETTER_AUTH_URL="http://localhost:3000"

# Node environment
NODE_ENV="development"

# AI API key (OpenRouter)
AI_API_KEY="Enter your OpenRouter API key"

# Stripe setup
STRIPE_SECRET_KEY="Enter your Stripe secret key"
STRIPE_WEBHOOK_SECRET="Enter your Stripe webhook secret"
```

**2. Client Setup (Frontend)**
Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```
**Environment Variables**
Create a .env file in the client folder:
```bash
# Backend url (Use localhost for development)
VITE_BASEURL=http://localhost:3000
```

**3. Run the Application**
Start the backend server:
```bash
cd server
npm run server
```
Start the frontend development server:
```bash
cd client
npm run dev
```

---

## 🌍 Deployment Guide (Vercel)
Both the Client and Server can be deployed separately on Vercel's free tier.

**1. Deploying Server:**
- Deploy the server folder to Vercel.
- Ensure you add all server .env variables to the Vercel project settings.
- Stripe Webhook Configuration: Go to your Stripe Dashboard ➡️ Webhooks. Add an endpoint pointing to your deployed server URL ending in /api/stripe (Ex: https://your-server.vercel.app/api/stripe). Select the checkout.session.completed event. Copy the resulting Webhook Secret and add it to your Vercel server environment variables as STRIPE_WEBHOOK_SECRET.

**2. Deploying Client:**
- Deploy the client folder to Vercel.
- Add the `VITE_BASEURL` environment variable to Vercel, pointing to your newly deployed Vercel Server URL.

**3. Finalizing Environment Links:**
- Go back to your Server environment variables in Vercel.
- Update `BETTER_AUTH_URL` to match your deployed Server URL.
- Update `TRUSTED_ORIGINS` to match your deployed Client URL.
- Ensure `NODE_ENV is set` to "production".

---

## 💻 Usage
**1. Authentication:** Register a new account to instantly receive your 20 free credits.

**2. Generate:** Provide a prompt (Ex: Create portfolio website suitable for web developer). The AI assistant will automatically enhance your prompt. Watch as the AI builds your site in real-time over the next few minutes.

**3. Iterate & Edit:** Once generated, ask the AI in the sidebar chat to make changes, or tweak the colors and text manually. If an AI change isn't quite right, use the rollback feature to return to the previous state.

**4. Export & Share:** Download the source code of your masterpiece, or toggle the publish status to share it with the world on the Community page.

**5. Top Up:** Running low on credits? Navigate to the pricing section to securely purchase a Basic, Pro, or Enterprise tier via Stripe.

---

## 📸 Screenshots

![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%201.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%202.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%203.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%204.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%205.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%206.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%207.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%208.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%209.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%2010.png)
![image alt](https://github.com/MrTharinduDasantha/AI-Website-Builder/blob/990dec095e485726357949180ca749150739f2fc/client/src/assets/website-images/Img%20-%2011.png)

<h4 align="center"> Don't forget to leave a star ⭐️ </h4>
