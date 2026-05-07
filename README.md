# 🇮🇳 Village Search API

A RESTful API to search and explore all villages, tehsils, districts, and states across India — built with Node.js, Express, and PostgreSQL.

---

## 📊 Data Coverage

| Level | Count |
|-------|-------|
| States & UTs | 29 |
| Districts | 530 |
| Sub-Districts (Tehsils) | 5,355 |
| Villages | 5,64,160 |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Data Source | MDDS (Ministry of Drinking Water & Sanitation) |

---

## 📁 Project Structure

```
Village_Search_API/
├── index.js              ← Main server file
├── db.js                 ← PostgreSQL connection
├── .env                  ← Environment variables (not pushed)
├── package.json
└── routes/
    ├── states.js         ← /states endpoints
    ├── districts.js      ← /districts endpoints
    ├── subdistricts.js   ← /subdistricts endpoints
    └── villages.js       ← /villages endpoints
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Priyanshuk1405/Village_Search_API.git
cd Village_Search_API
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hierarchy
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=3000
```

### 4. Set up PostgreSQL Database
Make sure you have PostgreSQL installed and the `hierarchy` database created with the following tables:
- `states`
- `districts`
- `sub_districts`
- `villages`

### 5. Run the server
```bash
node index.js
```

Server will start at: `http://localhost:3000`

---

## 🔌 API Endpoints

### 🏠 Welcome
```
GET /
```
Returns all available endpoints.

---

### 🗺️ States

#### Get all states
```
GET /states
```
**Response:**
```json
{
  "total": 29,
  "data": [
    { "state_code": 2, "state_name": "HIMACHAL PRADESH" },
    { "state_code": 6, "state_name": "HARYANA" }
  ]
}
```

#### Get one state
```
GET /states/:state_code
```

#### Get all districts in a state
```
GET /states/:state_code/districts
```
**Example:** `GET /states/8/districts`

---

### 🏙️ Districts

#### Get all districts
```
GET /districts
```

#### Get one district
```
GET /districts/:district_code
```

#### Get all sub-districts in a district
```
GET /districts/:district_code/subdistricts
```
**Example:** `GET /districts/23/subdistricts`

---

### 🏘️ Sub-Districts (Tehsils)

#### Get all sub-districts
```
GET /subdistricts
```

#### Get all villages in a sub-district
```
GET /subdistricts/:tehsil_code/villages
```
**Example:** `GET /subdistricts/100/villages`

---

### 🌿 Villages

#### Smart Search — Search everything at once
```
GET /villages/smart-search?q={query}
```
Searches across all levels — states, districts, tehsils, and villages — in a single request.

**Example:** `GET /villages/smart-search?q=Rampur`

**Response:**
```json
{
  "query": "Rampur",
  "results": {
    "states":    { "total": 0, "data": [] },
    "districts": { "total": 1, "data": [...] },
    "tehsils":   { "total": 3, "data": [...] },
    "villages":  { "total": 98, "data": [...] }
  }
}
```

#### Search villages by name
```
GET /villages/search?name={village_name}
GET /villages/search?name={village_name}&state_code={code}
```
**Example:** `GET /villages/search?name=Rampur&state_code=9`

#### Search villages by district name
```
GET /villages/by-district?name={district_name}
```
**Example:** `GET /villages/by-district?name=Dungarpur`

#### Get one village by code
```
GET /villages/:place_code
```
**Example:** `GET /villages/525002`

**Response:**
```json
{
  "place_code": 525002,
  "village_name": "Manibeli",
  "tehsil_name": "Akkalkuwa",
  "district_name": "Nandurbar",
  "state_name": "MAHARASHTRA",
  "full_address": "Manibeli, Akkalkuwa, Nandurbar, Maharashtra"
}
```

---

## 🔍 Search Tips

| You want to find | Use this |
|-----------------|----------|
| All villages named "Rampur" | `/villages/search?name=Rampur` |
| Villages in a specific state | `/villages/search?name=Rampur&state_code=9` |
| All villages in a district | `/villages/by-district?name=Dungarpur` |
| Search everything at once | `/villages/smart-search?q=Rampur` |
| All districts in Rajasthan | `/states/8/districts` |
| All tehsils in a district | `/districts/497/subdistricts` |

---

## 🗄️ Database Schema

```
states
  └── districts      (state_code → states.state_code)
        └── sub_districts  (district_code → districts.district_code)
                └── villages  (tehsil_code + district_code → sub_districts)
```

### Indexes for Performance
```sql
idx_villages_area_name      -- Fast village name search
idx_villages_tehsil         -- Villages by tehsil lookup
idx_villages_district       -- Villages by district lookup
idx_sub_districts_district  -- Tehsils by district lookup
idx_districts_state         -- Districts by state lookup
```

---

## 📬 Sample Requests

### Search "Dungarpur" (finds district + villages)
```bash
curl http://localhost:3000/villages/smart-search?q=Dungarpur
```

### Get all districts in Maharashtra (state_code = 27)
```bash
curl http://localhost:3000/states/27/districts
```

### Find all villages in Rampur district
```bash
curl http://localhost:3000/villages/by-district?name=Rampur
```

---

## 🚀 Future Improvements

- [ ] JWT Authentication
- [ ] API Key system for B2B clients
- [ ] Rate limiting
- [ ] Redis caching for faster responses
- [ ] Pagination support
- [ ] Deploy to Vercel / Railway
- [ ] Swagger API documentation

---

## 👨‍💻 Author

**Priyanshu Kansara**
- GitHub: [@Priyanshuk1405](https://github.com/Priyanshuk1405)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
