# 🚖 HackTaxi — Full-Stack Taxi Booking Web App

A professional, full-stack taxi booking web application built with **React + Vite** on the frontend and **Node.js + Express + MongoDB Atlas** on the backend. Features a real-time interactive map, rider booking flow, driver management, surge pricing simulation, and an admin analytics dashboard.

---

## ✨ Features

### 🧑 Rider Interface (`/`)
- Book a ride by selecting pickup and drop-off locations on an interactive Leaflet map
- Live fare estimation with surge pricing multiplier
- Real-time ride status updates
- Default map centered on **Lucknow, Uttar Pradesh, India**

### 🛠️ Admin Dashboard (`/admin`)
- Full driver management — add, view, and update driver status
- Live ride monitoring with filters
- Surge pricing zone configuration
- Analytics with **CSV export** support
- Zone management across the city

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v7, Vite, Leaflet / React-Leaflet |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (via Mongoose) |
| **Styling** | Vanilla CSS (dark theme, glassmorphism) |
| **Other** | dotenv, CORS, json2csv |

---

## 📁 Project Structure

```
hack_taxi/
├── index.html                  # App entry HTML
├── package.json                # Frontend dependencies
├── src/
│   ├── App.jsx                 # Root component with routing
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global styles (dark theme)
│   ├── components/
│   │   ├── Header.jsx          # Top navigation bar
│   │   └── MapView.jsx         # Leaflet map component
│   └── pages/
│       ├── RiderPage.jsx       # Rider booking interface
│       └── AdminPage.jsx       # Admin dashboard
└── server/
    ├── server.js               # Express app + MongoDB connection
    ├── package.json            # Backend dependencies
    ├── models/
    │   ├── Ride.js             # Ride schema
    │   ├── Driver.js           # Driver schema
    │   └── Zone.js             # Pricing zone schema
    └── routes/
        ├── rides.js            # Ride API endpoints
        ├── drivers.js          # Driver API endpoints
        └── zones.js            # Zone API endpoints
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account

---

### 1. Clone the Repository

```bash
git clone https://github.com/Kshitij575/Taxi_Booking.git
cd Taxi_Booking
```

---

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=4000
```

Start the backend server:

```bash
npm run dev
```

The API will be running at `http://localhost:4000`

---

### 3. Setup the Frontend

Open a **new terminal** in the root project folder:

```bash
npm install
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET/POST` | `/api/rides` | Get all rides / Create new ride |
| `GET/POST` | `/api/drivers` | Get all drivers / Add a driver |
| `GET/POST` | `/api/zones` | Get all zones / Create a zone |
| `GET` | `/api/rides/export` | Export rides as CSV |

---

## 📸 Screenshots

> Rider booking page with interactive map and fare estimator

> Admin dashboard with driver management and analytics

---

## 🔒 Environment Variables

Never commit your `.env` file. It is already excluded via `.gitignore`. Required variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `PORT` | Port for the Express server (default: `4000`) |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ by <a href="https://github.com/Kshitij575">Kshitij</a></p>
