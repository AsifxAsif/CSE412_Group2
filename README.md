# 📁 CSE412 Group 2 - File Storage Web Application

A fully responsive file storage and management system built for the CSE412 course project. This application allows users to register, log in, upload text or image files, and view/manage them through a clean dashboard interface.

---

## 🧑‍🤝‍🧑 Group Members

| Name                   | Student ID    |
|------------------------|---------------|
| Md. Asifuzzaman        | 2021-3-60-167 |
| Tawhidur Rahman        | 2021-3-60-233 |
| Arpita Biswas Deepa    | 2021-3-60-055 |
| Md. Mehedi Hasan Tazim | 2021-3-60-080 |


---

## 🔧 Features

- ✅ User Registration and Login with validation  
- ✅ File upload via modal (supports `.txt`, `.jpg`, `.png`, etc.)  
- ✅ Auto-sort files by type into subdirectories (`uploads/txt/`, `uploads/img/`)  
- ✅ Scrollable list of uploaded files  
- ✅ Responsive and modern dashboard design  
- ✅ Live search functionality to filter files  

---

## 💻 Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript  
- **Backend:** PHP (procedural)  
- **Database:** MySQL (via XAMPP)  
- **Other Tools:** XAMPP for local server environment  

---

## 📂 Folder Structure

```
CSE412_group2/
├── index.html              # Login/Register landing page
├── dashboard.html          # User dashboard for file management
├── css/
│   ├── index.css           # Styling for login/register page
│   └── dashboard.css       # Styling for dashboard
├── js/
│   ├── index.js            # Login/register behavior (form toggle, alerts)
│   └── dashboard.js        # File upload modal, list, search
└── php/
    ├── db.php              # DB connection (MySQL)
    ├── register.php        # User registration logic
    ├── login.php           # User login logic (with localStorage redirect)
    ├── logout.php          # Logout logic
    ├── upload.php          # File upload and sorting logic
    ├── list_files.php      # Fetch and list uploaded files per user
    └── login_error.php     # Returns session error via JSON
```

---

## ⚙️ Setup Instructions

1. **Install XAMPP** and run Apache & MySQL.  
2. **Place the project** folder in `htdocs` directory (e.g., `C:\xampp\htdocs\CSE412_group2`).  
3. **Start MySQL** and create a database named `group2`:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```sql
CREATE TABLE uploaded_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

4. **Run the project** in your browser:  
```
http://localhost/CSE412_group2/index.html
```

5. **Register a user**, log in, and start uploading!