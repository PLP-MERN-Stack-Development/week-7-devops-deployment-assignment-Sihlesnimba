# GlowPoints

GlowPoints is a rewards tracking web application built using the MERN stack (MongoDB, Express, React, Node.js). It allows business owners to track customer visits, mark rewards eligibility, and export customer data.

## Features

- User registration and login with username and PIN
- Add new customers and track visits
- QR code scanning to log visits
- Rewards eligibility based on number of visits
- Export customer data as CSV or PDF
- Light/Dark mode toggle
- Fully responsive UI

## Tech Stack

**Frontend:** React, Tailwind CSS, Framer Motion, qrcode.react, react-csv, jsPDF, Vercel
**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, dotenv, Render

## Deployment

### Frontend

- Hosted on **Vercel**
- URL: [https://glowpoints.vercel.app](https://glowpoints.vercel.app)

### Backend

- Hosted on **Render**
- API Base URL: `https://glowpoints-backend.onrender.com`

## Getting Started (Local Setup)

### Prerequisites

- Node.js & npm
- MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Sihlesnimba/glowpoints-frontend.git
git clone https://github.com/Sihlesnimba/glowpoints-backend.git
```

### 2. Backend Setup

```bash
cd glowpoints-backend
npm install
```

Create a `.env` file:

```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../glowpoints-frontend
npm install
npm start
```

## Usage

- Create an account or log in with your username and PIN.
- Add customers with name and phone number.
- Use QR code or manual log to register visits.
- Track total visits and reward eligibility.

---

Built with ❤️ for the Vibe Coding Hackathon 2.0
