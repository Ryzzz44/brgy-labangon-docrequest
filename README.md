# Barangay Labangon Document Request System

CSIT321 project of **Salado, Rafanan and Sanchez**. Residents request barangay documents online and track them;
barangay staff verify, process and release them.

| Part | Technology | Folder |
|---|---|---|
| Frontend (screens) | React 18 + Vite + Tailwind CSS 4 | [`frontend/`](frontend) |
| Backend (API, rules) | Spring Boot 3.3 (Java 21), Spring Security + JWT | [`backend/`](backend) |
| Database | MySQL 8 (XAMPP or MySQL Workbench) | created automatically |

More documents:
- [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md): how we use branches (read this first)
- [docs/TASKS.md](docs/TASKS.md): who builds what
- [docs/ERD.md](docs/ERD.md): database tables and relationships
- [reference/](reference): the earlier Firebase version, used only as a design reference

---

## 1. Install once

| Tool | Where | Check with |
|---|---|---|
| Java JDK 21 | adoptium.net (Temurin 21, tick "Set JAVA_HOME") | `java -version` |
| Maven | maven.apache.org/download.cgi (unzip, add its `bin` folder to PATH). IntelliJ IDEA already includes Maven. | `mvn -v` |
| Node.js LTS | nodejs.org | `node -v` |
| XAMPP (MySQL) | apachefriends.org | start **MySQL** in the XAMPP Control Panel |
| Git | git-scm.com | `git --version` |
| VS Code extensions | open this folder in VS Code and accept the recommended extensions | |

## 2. Get the code

```bash
git clone https://github.com/Ryzzz44/brgy-labangon-docrequest.git
cd brgy-labangon-docrequest
git checkout dev
```

## 3. Run the backend (terminal 1)

1. Start **MySQL** in XAMPP. The `brgy_labangon` database and all tables are created automatically on the first run.
2. Run:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. Open http://localhost:8080/api/health. It should show `{"status":"ok"}`.

If your MySQL has a password, set it before running (PowerShell): `$env:DB_PASSWORD="yourpassword"`.

**First staff account** (created automatically when the staff table is empty):
`staff@labangon.local` / `ChangeMe123!`. Change these with the `STAFF_EMAIL` and `STAFF_PASSWORD`
environment variables before the barangay uses the system.

## 4. Run the frontend (terminal 2)

```bash
cd frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev
```

- Resident site: http://localhost:5173
- Staff site: http://localhost:5173/?role=staff

## 5. Project structure

```
backend/src/main/java/ph/brgylabangon/docrequest/
  entity/       database tables (@Entity classes)          -> shared
  repository/   database queries (Spring Data JPA)         -> shared
  security/     JWT login token check                      -> shared
  config/       security rules, CORS, first staff account  -> shared
  dto/          JSON request/response shapes
  service/      business rules (one service per feature)
  controller/   REST endpoints (one controller per feature)
  exception/    error -> JSON { "message": "..." }

frontend/src/
  api/          functions that call the backend
  components/   shared UI (buttons, modals, layout)
  pages/        Welcome, Login, Register
  pages/resident/  one file per resident tab
  pages/staff/     one file per staff tab
```

Each feature has its own controller, service and screen files, so the three of us rarely edit the same file.
