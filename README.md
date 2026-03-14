# CampusGuardian AI: Intelligent Campus Well-being & Resource Management

CampusGuardian AI is a comprehensive, full-stack platform designed to proactively identify student dropout and suicide risks while optimizing campus resources. The system leverages predictive analytics and behavioral monitoring to provide early intervention alerts and efficient facility management through a unified governance workflow.

## 🚀 Vision
To foster a safer, healthier, and more sustainable academic environment by combining student well-being intelligence with smart resource utilization.

---

## 🌟 Key Features

### 1. Student Portal
*   **Manual Data Desk:** Securely entry for Academic (CGPA, Sem, Dept) and Health metrics.
*   **Evidence Uploads:** Support for multi-file verification (Marks Memos, Attendance proof, Medical Reports).
*   **Proactive Support:** Explicit toggles to request counseling help.
*   **Guidance Hub:** View personalized reports and AI-generated risk analysis feedback.

### 2. Administrative Hub
*   **Verification Queue:** Centralized approval workflow for all student data submissions.
*   **Data Governance:** One-click approval to forward verified data to professional counselors.
*   **System Auditing:** High-level visibility into closed intervention cycles.

### 3. Counseling Center
*   **AI Triage:** Automated risk assessment model that scores students based on academic and behavioral trends.
*   **Actionable Reports:** Two-path intervention system (Direct Session vs. Tactical Suggestions).
*   **Risk Reporting:** Generates detailed AI analysis reports for student files.

### 4. Hostel Manager Hub
*   **3-Bed Matrix Logic:** Visual grid showing granular occupancy details for students and rooms.
*   **Room Merger Algorithm:** Intelligent consolidation of partially filled rooms to save energy and optimize space.
*   **Resource Analytics:** Real-time electricity usage estimation and Daily Mess Attendance reports.

---

## 🛠️ Tech Stack

### Frontend
*   **React.js (Vite)** - Component-based reactive UI.
*   **Vanilla CSS3** - Premium **Glassmorphism** design system and animations.
*   **Lucide Icons** - Modern, consistent iconography.
*   **React Router** - Multi-role protected routing.

### Backend
*   **Python Flask** - RESTful API architecture.
*   **MySQL** - Relational database for persistent storage.
*   **JWT** - Secure, role-based authentication.

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js & npm
*   Python 3.x
*   XAMPP (for MySQL)

### 1. Database Setup
1.  Open XAMPP and start **MySQL** on port **3308**.
2.  Import `backend/db_setup.sql` or run the initialization script:
    ```bash
    cd backend
    python init_db.py
    ```

### 2. Backend Setup
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install flask flask-cors mysql-connector-python pyjwt
    ```
4.  Start the server:
    ```bash
    python app.py
    ```

### 3. Frontend Setup
1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 🔐 Mock Credentials for Testing
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `admin` |
| **Student** | `student@test.com` | `student` |
| **Counselor** | `counselor@test.com` | `counselor` |
| **Hostel Manager** | `hostel@test.com` | `hostel` |

---

## 📁 Project Structure
```text
hackathon/
├── backend/
│   ├── app.py             # Flask Entry Point
│   ├── routes.py          # API Endpoints
│   ├── db.py              # MySQL Connection
│   ├── auth.py            # JWT Authentication
│   └── db_setup.sql       # Database Schema
├── frontend/
│   ├── src/
│   │   ├── pages/         # Dashboard Screens
│   │   ├── context/       # Auth State
│   │   └── App.jsx        # Routing
│   └── index.css          # Design Tokens
└── README.md
```

## 🏆 Hackathon Submission
Designed and developed for a proactive AI-driven Campus Intelligence solution. 
