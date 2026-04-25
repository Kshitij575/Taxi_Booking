# 🚖 HackTaxi — Full-Stack Taxi Booking Web App

A professional, full-stack taxi booking web application built with **React + Vite** on the frontend and **Node.js + Express + MongoDB Atlas** on the backend. Features a real-time interactive map, rider booking flow, driver management, surge pricing simulation, and an admin analytics dashboard.

---

## ✨ Features

### 🧑 Rider Interface (`/rider`)
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


<p align="center">Made by <a href="https://github.com/Kshitij575">Kshitij</a></p>
