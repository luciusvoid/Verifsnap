<div align="center">

<br/>

```
██╗   ██╗███████╗██████╗ ██╗███████╗███████╗███╗   ██╗ █████╗ ██████╗ 
██║   ██║██╔════╝██╔══██╗██║██╔════╝██╔════╝████╗  ██║██╔══██╗██╔══██╗
██║   ██║█████╗  ██████╔╝██║█████╗  ███████╗██╔██╗ ██║███████║██████╔╝
╚██╗ ██╔╝██╔══╝  ██╔══██╗██║██╔══╝  ╚════██║██║╚██╗██║██╔══██║██╔═══╝ 
 ╚████╔╝ ███████╗██║  ██║██║██║     ███████║██║ ╚████║██║  ██║██║     
  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     
```

### **The Decentralized Web Archiving Dashboard**
*Built on the Shelby Protocol — Capture. Verify. Preserve.*

<br/>

[![Built with Shelby](https://img.shields.io/badge/Powered%20By-Shelby%20Protocol-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOCA0IDgtNFYzTDIgN3oiLz48L3N2Zz4=)](https://shelby.io)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-f97316?style=for-the-badge)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

> **"The internet forgets. Verifsnap doesn't."**

<br/>

</div>

---

## 🌐 What is Verifsnap?

**Verifsnap** is a cutting-edge, decentralized web archiving dashboard — an official UI client built on top of the **[Shelby Protocol](https://shelby.io)**.

In a world where websites get taken down, articles get edited, and digital evidence disappears without a trace, Verifsnap gives you the power to **capture any web page at a point in time**, store it on the decentralized Shelby network, and **verify its authenticity forever** with cryptographic proof — all through a sleek, modern dashboard.

No centralized server. No data silos. Just **your wallet, your data, and the blockchain**.

> ⚠️ **Important Scope & Limitations:**  
> Verifsnap is specifically designed to archive **public web data** (e.g., public social media posts, news articles, portfolios, public corporate websites). It **cannot** capture private or logged-in pages (such as your personal banking dashboard or private Instagram accounts) because the backend server performs the capture anonymously without your browser cookies or sessions.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📸 **One-Click Archiving** | Enter any URL and capture a permanent, tamper-proof snapshot in seconds |
| 🔐 **Wallet-Native Auth** | Login with your Aptos wallet (Petra, Keyless/Google) — no email, no password |
| 📁 **Smart Collections** | Organize archives into color-coded, icon-tagged collections |
| 📊 **Activity Dashboard** | Full history of all your archiving activity with status tracking |
| 🌓 **Dark / Light Mode** | Polished UI with seamless theme switching |
| ⚡ **Blazing Fast** | Built on TanStack Start with server-side rendering (SSR) for instant loads |
| 🔗 **On-Chain Verification** | Every snapshot is anchored to the Shelby decentralized network |
| 📱 **Fully Responsive** | Looks stunning on desktop, tablet, and mobile |

---

## 🏗️ Tech Stack

This project was built with a carefully chosen, modern technology stack:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   React 19  •  TanStack Start  •  TypeScript 5.8            │
│   Tailwind CSS v4  •  Framer Motion  •  Radix UI            │
│   TanStack Router  •  TanStack Query  •  Recharts           │
├─────────────────────────────────────────────────────────────┤
│                        WEB3 LAYER                           │
│   Shelby Protocol SDK  •  Aptos Wallet Adapter              │
│   Ed25519 Signature Verification                            │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                              │
│   TanStack Server Functions  •  Supabase (PostgreSQL)       │
│   Vercel Serverless Functions                               │
├─────────────────────────────────────────────────────────────┤
│                      INFRASTRUCTURE                         │
│   Vercel (Hosting)  •  Vite 7  •  Nitro                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** v20 or higher
- **npm** v10 or higher
- An **Aptos Wallet** (e.g., [Petra Wallet](https://petra.app/))

You will also need accounts on the following services:
- **[Supabase](https://supabase.com/)** — Free tier is more than enough to get started
- **[Shelby Protocol](https://shelby.io/)** — For the archiving API Key

---

### 1. Clone the Repository

```bash
git clone https://github.com/luciusvoid/Verifsnap.git
cd verifsnap
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Your Environment

Copy the environment template file:

```bash
cp .env.example .env
```

Then open `.env` and fill in your credentials:

```env
# ── Supabase ──────────────────────────────────────────────────
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ── Shelby Protocol ───────────────────────────────────────────
VITE_SHELBY_API_KEY=your-shelby-api-key
```

> 💡 **Where to find these values?**
> - **Supabase:** Go to your project's **Settings → API** page.
> - **Shelby:** Check your dashboard at [shelby.io](https://shelby.io/).

### 4. Set Up the Database

In your Supabase project, go to the **SQL Editor** and run the contents of the `supabase_schema.sql` file. This will create all the necessary tables and Row Level Security (RLS) policies.

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) and connect your Aptos wallet! 🎉

---

## ☁️ Deploy to Vercel

Deploy your own Verifsnap instance to the internet in minutes:

**Step 1:** Push your code to a GitHub repository.

**Step 2:** Go to [vercel.com](https://vercel.com), create a new project, and import your repository.

**Step 3 (Critical):** Before clicking **Deploy**, navigate to **Settings → Environment Variables** and add all the keys from your `.env` file:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_SHELBY_API_KEY
```

**Step 4:** Click **Deploy** — your app will be live within 2 minutes! 🚀

> ⚠️ **Forgot to add Environment Variables?** Don't worry. Just add them in your Vercel project **Settings → Environment Variables**, then go to **Deployments** and click **Redeploy**.

---

## 📁 Project Structure

```
verifsnap/
├── src/
│   ├── routes/                  # All application pages (file-based routing)
│   │   ├── index.tsx            # Landing / Login page
│   │   ├── dashboard.index.tsx  # Main dashboard overview
│   │   ├── dashboard.storage.tsx  # Archives list
│   │   ├── dashboard.collections.tsx  # Collections manager
│   │   ├── dashboard.settings.tsx  # User settings & profile
│   │   └── dashboard.archive.$id.tsx  # Archive detail view
│   ├── components/              # Reusable UI components
│   │   └── ui/                  # Radix UI primitives (shadcn/ui)
│   ├── lib/
│   │   ├── mock-data.ts         # Data layer (Supabase queries)
│   │   └── supabase.ts          # Supabase client
│   └── server-functions/
│       └── auth.ts              # Server-side wallet verification
├── supabase_schema.sql          # Database schema and RLS policies
├── .env.example                 # Environment variable template
└── vite.config.ts               # Build configuration
```

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is open-source and available under the **MIT License**.

---

<div align="center">

<br/>

Built with ❤️ on the **[Shelby Protocol](https://shelby.io)**

*The Decentralized Web Preservation Layer*

<br/>

⭐ **If you find this project useful, please consider giving it a star!** ⭐

</div>
