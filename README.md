# 🏥 Patient Portal – Full Stack Assignment

A mini healthcare document portal where users can upload, view, download, and delete their medical documents (PDFs).  
This project includes a complete **frontend**, **backend**, **database**, and **file handling** system.

---

# 📁 Project Structure

```
patient-portal-assignment/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── backend/
│   ├── index.js
│   ├── package.json
│   └── database.sqlite (auto-created)
│
├── uploads/ (auto-created, stores uploaded PDFs)
├── design.md
└── README.md
```

---

# 🚀 How to Run the Project Locally

### **1️⃣ Install backend dependencies**
```bash
cd backend
npm install
```

### **2️⃣ Start the server**
```bash
node index.js
```

If successful, you will see:
```
Server running on http://localhost:4000
```

### **3️⃣ Open the application**

In your browser, open:

```
http://localhost:4000/
```

🎉 The frontend UI loads automatically from the backend.

---

# 📄 Features

### ✔ Upload PDF files  
Only PDFs are allowed (max 10 MB)

### ✔ View uploaded documents  
Displays filename, file size, and upload time

### ✔ Download documents  
Files are streamed from the backend

### ✔ Delete documents  
Removes file from disk + metadata from database

### ✔ Frontend built with animations  
Modern UI using HTML, CSS, JS

### ✔ Backend built with Express + Multer  
Handles file uploads and routing

### ✔ Database: SQLite  
Stores metadata locally inside backend folder

---

# 📡 API Specification

| Method | Endpoint            | Description                        |
|--------|----------------------|------------------------------------|
| POST   | `/documents/upload`  | Upload a PDF file                  |
| GET    | `/documents`         | List all documents                 |
| GET    | `/documents/:id`     | Download a file                    |
| DELETE | `/documents/:id`     | Delete a file and its metadata     |


### Example: Upload a PDF
```bash
curl -X POST http://localhost:4000/documents/upload \
     -F "file=@sample.pdf"
```

### Example: Get all PDFs
```bash
curl http://localhost:4000/documents
```

### Example: Download a PDF
```bash
curl -OJ http://localhost:4000/documents/1
```

### Example: Delete a PDF
```bash
curl -X DELETE http://localhost:4000/documents/1
```

---

# 🗄 Database Schema (SQLite)

Table: **documents**

| Column     | Type     | Description                  |
|------------|----------|------------------------------|
| id         | integer  | Primary key                  |
| filename   | text     | Original file name           |
| filepath   | text     | Actual stored file name      |
| filesize   | integer  | Size in bytes                |
| created_at | text     | Upload timestamp             |

---

# 🧱 Tech Stack

### **Frontend**
- HTML  
- CSS (modern animations)
- JavaScript (fetch API)

### **Backend**
- Node.js  
- Express.js  
- Multer (file upload handling)

### **Database**
- SQLite (file-based, lightweight)

---

# 🔄 How the System Works (Data Flow)

### **1️⃣ File Upload**
1. User selects PDF  
2. Frontend sends file → `/documents/upload`  
3. Backend (Multer) validates & stores file in `uploads/`  
4. Metadata stored in SQLite  
5. UI updates the file list  

### **2️⃣ File Download**
1. User clicks download  
2. Frontend requests `/documents/:id`  
3. Backend streams the file to browser  

### **3️⃣ File Delete**
1. User clicks delete  
2. Backend removes file from disk  
3. Metadata removed from SQLite  

---

# 🧪 Assumptions
- Only PDF uploads allowed  
- Max file size = **10 MB**  
- Single user mode (no authentication)  
- Local storage is acceptable for assignment  
- SQLite is suitable for local development  

---

# 👨‍💻 Author
**Siddarth S Mallik**  
**📧 Email: **siddarthsmalliksiddusmallik@gmail.com**

---

