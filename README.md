
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
- ✅ **User Registration and Login with validation**  
- ✅ **File upload via modal** (supports `.txt`, `.jpg`, `.png`, `.jpeg`, `.gif`, `.mp3`, `.mp4`, `.pdf`, etc.)
- ✅ **Prevent uploading duplicate files**  
- ✅ **Automatic file categorization** by type into subdirectories(`uploads/txt/`, `uploads/img/`, `uploads/audio/`)  
- ✅ **Scroll through the list of uploaded files**  
- ✅ **Responsive and modern dashboard design**  
- ✅ **Live search functionality** to filter files by name  
- ✅ **File View Modal** for images, videos, PDFs, text, audio, etc.  
- ✅ **Rename files with modal confirmation**  
- ✅ **Delete files with confirmation modal and success message**  
- ✅ **Download files via button**  

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
├── css/                                # Styling for the website pages
│   ├── 404.css                         # Styling for the 404 page
│   ├── dashboard.css                   # Styling for the main user dashboard
│   ├── files.css                       # Styling for the dedicated files page
│   ├── folders.css                     # Styling for the dedicated folders page
│   ├── index.css                       # Styling for the login/register page
│   └── user.css                        # Styling for the user profile page
├── js/                                 # JavaScript logic for the website pages
│   ├── dashboard.js                    # Logic for file upload, listing, search on the dashboard
│   ├── files.js                        # Logic for the files.html page
│   ├── folders.js                      # Logic for the folders.html page
│   ├── index.js                        # Login/register form toggle and validation
│   └── user.js                         # Logic for user profile page, password update, etc.
├── php/                                # PHP backend logic and database interactions
│   ├── db.php                          # Database connection configuration
│   ├── delete_file.php                 # Logic for deleting a file
│   ├── download_file.php               # Logic for downloading a file
│   ├── folder-functions.php            # Functions for creating and managing folders
│   ├── get_files.php                   # Logic for fetching file details
│   ├── list_files.php                  # Fetches and lists all files for a user
│   ├── list_folders.php                # Fetches and lists folders for a user
│   ├── list_main_categories.php        # Lists main file categories
│   ├── login_error.php                 # Returns session error via JSON
│   ├── login.php                       # User login logic
│   ├── logout.php                      # User logout logic
│   ├── register.php                    # User registration logic
│   ├── rename_file.php                 # Logic for renaming a file
│   ├── subfolder-functions.php         # Functions for managing files within subfolders
│   ├── update_password.php             # Logic for updating user passwords
│   └── upload.php                      # File upload and categorization logic
├── resource/                           # Directory for all image assets, icons, etc.
│   ├── audio.jpg                       # Thumbnail for audio files
│   ├── cloud-up.png                    # Cloud upload icon
│   ├── code.jpg                        # Thumbnail for code files
│   ├── default.jpg                     # Generic thumbnail
│   ├── document.jpg                    # Thumbnail for text documents
│   ├── DropNova.png                    # Project logo
│   ├── excel.jpg                       # Thumbnail for spreadsheets
│   ├── favicon.ico                     # Website favicon
│   ├── image.jpg                       # Thumbnail for image files
│   ├── other.jpg                       # Thumbnail for uncategorized files
│   ├── ppt.jpg                         # Thumbnail for presentations
│   └── video.jpg                       # Thumbnail for video files
├── 404.html                            # Custom error page
├── dashboard.html                      # Main user dashboard
├── files.html                          # Page to list and manage all files
├── folders.html                        # Page to list and manage folders
├── index.html                          # Login/Register landing page
├── navbar.html                         # Reusable navigation bar component
└── user.html                           # User profile page (view and update)
```

---

## ⚙️ Setup Instructions

1. **Install XAMPP** and run Apache & MySQL.  
2. **Place the project** folder in `htdocs` directory (e.g., `C:\xampp\htdocs\CSE412_group2`).  
3. **Start MySQL** and just go to `http://localhost/CSE412_group2/`. The code auto generated the database named `group2`:

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
    filepath VARCHAR(512) NOT NULL,
    category VARCHAR(100) DEFAULT NULL,
    subfolder VARCHAR(100) DEFAULT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

4. **Run the project** in your browser:  
```
http://localhost/CSE412_group2/index.html
```

5. **Register a user**, log in, and start uploading!
