# RoomReserve Deployment and Running Guide

RoomReserve is a full-stack application consisting of an **Angular 18+ Frontend** and a **Spring Boot Java (JDK 17) Backend**. It includes local seed data for testing out of the box.

---

## 🚀 Running Locally

### Option A: Using Docker & Docker Compose (Recommended)

Docker Compose spins up a local MySQL database, compiles the Java backend, and builds the Angular frontend, configuring the connection parameters automatically.

1. **Start the containers** from the project root directory:
   ```bash
   docker-compose up --build
   ```
2. **Access the application**:
   - Frontend: [http://localhost:8081](http://localhost:8081)
   - Backend: [http://localhost:8080](http://localhost:8080)
   - Local MySQL: Port `3306` (Username: `roomuser`, Password: `roompassword`, Database: `roomreserve`)

3. **Seeded Test Credentials**:
   - **Administrator**:
     - Username: `admin`
     - Password: `adminpass`
   - **Approver**:
     - Username: `approver`
     - Password: `approverpass`
   - **Employee (Regular User)**:
     - Username: `alice`
     - Password: `password`

---

### Option B: Running without Docker (Manual)

#### Prerequisites
- **Java JDK 17** (or higher)
- **Node.js** (v18 or higher)
- **MySQL Server** running locally on port 3306

#### Step 1: Set Up Backend Database
Create a schema named `roomreserve` in your MySQL database. Set the following environment variables (or configure them in `booking-service/booking-service/src/main/resources/application.properties`):
```bash
# Windows (PowerShell)
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/roomreserve?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true"
$env:SPRING_DATASOURCE_USERNAME="your_mysql_username"
$env:SPRING_DATASOURCE_PASSWORD="your_mysql_password"
$env:CORS_ALLOWED_ORIGINS="http://localhost:4200"
```

#### Step 2: Run Backend
Navigate to `booking-service/booking-service` and run:
```bash
./mvnw spring-boot:run
```

#### Step 3: Run Frontend
Navigate to `room-reserve-frontend` and run:
```bash
npm install
npm start
```
The Angular app will run on [http://localhost:4200](http://localhost:4200) and proxy API calls automatically to `http://localhost:8080`.

---

## ☁️ Deploying to the Cloud

To deploy RoomReserve to the cloud for public access, we recommend using **Render** (for the backend and/or database) and **Vercel** or **Render** (for the frontend).

### 1. Deploy the Backend to Render

1. Create a free account at [Render](https://render.com).
2. Create a **MySQL / PostgreSQL database** on Render (or use your existing cloud database provider like Aiven).
3. Create a new **Web Service** on Render and link it to your GitHub Repository containing this project.
4. Configure the Web Service settings:
   - **Root Directory**: `booking-service/booking-service`
   - **Runtime**: `Docker`
   - **Build Trigger**: Select your desired branch (e.g. `main`).
5. Add the following **Environment Variables** in the Render settings:
   - `SPRING_DATASOURCE_URL`: (Your database connection string, e.g. `jdbc:mysql://<host>:<port>/<db_name>`)
   - `SPRING_DATASOURCE_USERNAME`: (Your database user, e.g. `avnadmin` or `root`)
   - `SPRING_DATASOURCE_PASSWORD`: (Your database password)
   - `CORS_ALLOWED_ORIGINS`: (Set this to your frontend URL, e.g., `https://room-reserve-frontend.vercel.app` or `https://roomreserve.onrender.com`. Multiple URLs can be separated by commas.)
6. Deploy the Web Service. Render will build the Docker container and expose a public URL (e.g., `https://roomreserve-backend.onrender.com`). Note down this URL.

---

### 2. Deploy the Frontend (Choose Option A or B)

#### Option A: Deploy Frontend to Vercel (Recommended)

Vercel is the easiest and fastest way to host frontend Angular applications statically.

1. Go to [Vercel](https://vercel.com) and create an account.
2. Click **Add New** -> **Project** and import your GitHub Repository.
3. In the project settings, configure:
   - **Root Directory**: `room-reserve-frontend`
   - **Framework Preset**: `Angular`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/room-reserve-frontend/browser` (Vercel reads this from `vercel.json` automatically)
4. Add the **Environment Variable** in the Vercel project configuration:
   - Name: `ROOM_RESERVE_API_BASE`
   - Value: `https://your-backend-service.onrender.com` (Your Render backend URL from the previous step)
5. Click **Deploy**. Vercel will trigger the custom script `write-env.js` to build the app with the correct backend URL configuration.

#### Option B: Deploy Frontend to Render

If you prefer to deploy the frontend as a Docker container on Render:

1. Create a new **Web Service** on Render.
2. Link your GitHub Repository.
3. Configure the Web Service:
   - **Root Directory**: `room-reserve-frontend`
   - **Runtime**: `Docker`
4. Add the **Environment Variable** in the Render dashboard:
   - Name: `ROOM_RESERVE_API_BASE`
   - Value: `https://your-backend-service.onrender.com` (Your Render backend URL)
5. Deploy the Web Service. Render will build the Nginx Docker container and dynamically inject the backend API URL at runtime.
