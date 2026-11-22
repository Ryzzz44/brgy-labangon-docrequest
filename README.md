# Barangay Labangon Document Request System

CSIT321 project of **Salado, Rafanan and Sanchez**. Residents request barangay documents online and track them;
barangay staff verify, process and release them.

| Part | Technology | Folder |
|---|---|---|
| Frontend (screens) | React 18 + Vite + Tailwind CSS 4 | [`frontend/`](frontend) |
| Backend (API, rules) | Spring Boot 3.3 (Java 17+), Spring Security + JWT | [`backend/`](backend) |
| Database | MySQL 8 (MySQL Server + Workbench) | created automatically |

## Team and pages

Every page also opens on its own, without logging in, when the backend and frontend are running
(see [Demo mode](#demo-mode-for-presentations)). All pages: http://localhost:5173/?page=all

| Member | Module | Use cases | Pages (direct links) | Pull requests |
|---|---|---|---|---|
| **Samuel O. Salado** | Resident Request | UC-01, UC-02, forgot password | [Dashboard](http://localhost:5173/?page=dashboard), [Request Document](http://localhost:5173/?page=request), [Track Requests](http://localhost:5173/?page=track), [Notifications](http://localhost:5173/?page=notifications), Forgot / Reset Password | #14, #17 |
| **James Carl P. Rafanan** | Staff Dashboard & Releasing | UC-05, UC-06, UC-08, UC-09 | [Requests](http://localhost:5173/?role=staff&page=requests), [Reports](http://localhost:5173/?role=staff&page=reports), [Notifications](http://localhost:5173/?role=staff&page=notifications), [Announcements](http://localhost:5173/?role=staff&page=announcements) | #15, #18 |
| **Sean Anthony P. Sanchez** | Request Management | UC-03, UC-04, UC-07 | [Manage Requests](http://localhost:5173/?page=manage), [Archive](http://localhost:5173/?page=archive), [My Profile](http://localhost:5173/?page=profile), [Activity Log](http://localhost:5173/?role=staff&page=activity) | #16, #19 |

The files, endpoints and rules behind each page are listed in [docs/TASKS.md](docs/TASKS.md).

More documents:
- [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md): how we use branches (read this first)
- [docs/TASKS.md](docs/TASKS.md): who builds what
- [docs/ERD.md](docs/ERD.md): database tables and relationships
- [reference/](reference): the earlier Firebase version, used only as a design reference

---

## 1. Install once

| Tool | Where | Check with |
|---|---|---|
| Java JDK 17 or newer | adoptium.net (Temurin 17 or 21, tick "Set JAVA_HOME") | `java -version` |
| Maven | maven.apache.org/download.cgi (unzip, add its `bin` folder to PATH). IntelliJ IDEA already includes Maven. | `mvn -v` |
| Node.js LTS | nodejs.org | `node -v` |
| MySQL Server 8 + MySQL Workbench | dev.mysql.com/downloads/installer (remember the root password) | Workbench connects to `localhost:3306` |
| Git | git-scm.com | `git --version` |
| VS Code extensions | open this folder in VS Code and accept the recommended extensions | |

## 2. Get the code

```bash
git clone https://github.com/Ryzzz44/brgy-labangon-docrequest.git
cd brgy-labangon-docrequest
```

The finished system is on `main`. Teammates making changes work on their `feature/...` branch and merge into `dev`
(see [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md)).

## 3. Run the backend (terminal 1)

1. Make sure the MySQL service (**MySQL84** or **MySQL80**) is running (Windows Services, or MySQL Workbench). The `brgy_labangon`
   database and all tables are created automatically on the first run.
2. Give the backend your MySQL root password once (PowerShell, then reopen VS Code):
   `[Environment]::SetEnvironmentVariable("DB_PASSWORD", "yourpassword", "User")`
3. Run the backend, either way:
   - **VS Code:** open `backend/src/main/java/ph/brgylabangon/docrequest/DocRequestApplication.java` and click **Run** above `main`.
   - **Terminal:** `cd backend` then `mvn spring-boot:run`.
4. Open http://localhost:8080/api/health. It should show `{"status":"ok"}`.

XAMPP's MySQL also works, but only if no other MySQL is using port 3306.

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
- **Every page on its own, no login (for presentations): http://localhost:5173/?page=all**

## Demo mode (for presentations)

`app.demo-mode` is **on** by default when you run locally:
- pages opened with `?page=...` work without logging in (the API acts as the demo resident
  `juan@demo.local` / `Demo1234!` or the first staff account);
- an empty database gets sample requests in every status, so each member's page has data.

**Turn it off before real residents use the system:** set the environment variable `DEMO_MODE=false`.

## Forgot password emails

The "Forgot password?" page emails a one-time reset link (valid for 30 minutes).

- **Class demo (no email set up):** the link is printed in the backend console. Look for
  `[Forgot password] ... Reset link for ...` and open that link in the browser.
- **Real emails (Gmail):** turn on 2-Step Verification for the Gmail account, create an
  **App password** (Google Account > Security > App passwords), then set these environment variables
  before starting the backend: `MAIL_HOST=smtp.gmail.com`, `MAIL_USERNAME=<the Gmail address>`,
  `MAIL_PASSWORD=<the 16-letter app password>`. Never commit these values.

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
  pages/        Welcome, Login, Register, Forgot / Reset Password, registry.js (page list and owners)
  pages/resident/  one file per resident tab
  pages/staff/     one file per staff tab
```

Each feature has its own controller, service and screen files, so the three of us rarely edit the same file.
