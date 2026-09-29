# PikGrow Admin UI - React Dashboard

Converted to **React + Vite** with **100% visual and functional consistency** connecting directly to your live backend.

---

## 🔗 Live Backend Configuration

The application directly connects to your FastAPI backend at:
```javascript
const API_BASE = "http://localhost:9000";
```

### Endpoints:
- **API Dashboard**:
  - `GET http://localhost:9000/summary`
  - `GET http://localhost:9000/daily-summary`
  - `GET http://localhost:9000/endpoints`
  - `GET http://localhost:9000/slow`
  - **DB Admin**: Opens `http://localhost:9000/admin` in a new tab
- **User Metrics Dashboard**:
  - `GET http://localhost:9000/users/total`
  - `GET http://localhost:9000/users/monthly-active`
  - `GET http://localhost:9000/users/weekly-active`
  - `GET http://localhost:9000/users/farmers`
  - `GET http://localhost:9000/users/active-farmers`
  - `GET http://localhost:9000/users/buyers`
  - `GET http://localhost:9000/users/active-buyers`
  - `GET http://localhost:9000/users/recently-active`
- **Auto-Refresh**: Every 30 seconds (matches original script).

---

## 🚀 Running the Project

### Start Development Server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** (or `http://127.0.0.1:3000`).

### Production Build:
```bash
npm run build
```
