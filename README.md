# Person API (Express + MySQL)

Production-ready CRUD HTTP API for a **Person** entity using **Express.js** and **MySQL**.  
Meets the assignment requirements: JSON I/O, SQL storage, public API (no auth), pagination ordered by email,  
contacts as references, logs, cache, configuration, and cURL examples.  

> Node.js LTS **22.18.0**

---

## Person Model
- `id`
- `name` (required)
- `surname` (required)
- `age`
- `gender` (valid: `male` | `female`)
- `birthday`
- `phone`
- `email` (required, unique)
- `contacts` (list of people — references via junction table)
- `created`
- `modified`

---

## Quick Start

### 1) Clone & Install
```bash
git clone <your-repo-url> person-api
cd person-api
cp .env.example .env
npm install
