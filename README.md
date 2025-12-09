# Patient Portal – Full Stack Assignment

This project implements a **Patient Portal** where a user can upload, view, download, and delete **PDF medical documents** such as prescriptions, test results or referral notes.

It meets all assignment requirements using a **frontend + backend + SQLite database**.

---

# 📁 Folder Structure

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
│   └── database.sqlite  (ignored in git)
│
├── uploads/  (ignored in git)
├── design.md or design.pdf
├── README.md
└── .gitignore
```

---

# 🚀 1. Project Overview

This application allows users to:

- Upload **PDF files**
- View a list of uploaded files
- Download documents
- Delete documents
- Store files locally in `uploads/`
- Store metadata (filename, size, created_at) in a SQLite database

**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js + Express  
**Database:** SQLite  

---

# ⚙️ 2. How to Run Locally

### **Step 1 — Install backend dependencies**
```
cd backend
npm install
```

### **Step 2 — Start the backend server**
```
node index.js
```

You should see:
```
Server running on http://localhost:4000
```

### **Step 3 — Open frontend**
Go to:

```
http://localhost:4000/frontend/index.html
```

---

# 📡 3. API Endpoints

## 🔹 Upload PDF  
**POST** `/documents/upload`

Example:
```
curl -X POST http://localhost:4000/documents/upload -F "file=@C:/Users/YourName/example.pdf"
```

Response:
```json
{
  "success": true,
  "document": {
    "id": 1,
    "filename": "example.pdf",
    "filepath": "170000_example.pdf",
    "filesize": 23456,
    "created_at": "2025-12-09T10:14:05Z"
  }
}
```

---

## 🔹 List all documents  
**GET** `/documents`

Example:
```
curl http://localhost:4000/documents
```

Response:
```json
[
  {
    "id": 1,
    "filename": "example.pdf",
    "filesize": 23456,
    "created_at": "2025-12-09T10:14:05Z"
  }
]
```

---

## 🔹 Download a document  
**GET** `/documents/:id`

Example:
```
curl -OJ http://localhost:4000/documents/1
```

---

## 🔹 Delete a document  
**DELETE** `/documents/:id`

Example:
```
curl -X DELETE http://localhost:4000/documents/1
```

Response:
```json
{"success": true}
```

---

# 🧠 4. Architecture Overview

### System Flow
1. User interacts with **frontend UI**.
2. Frontend communicates with **Express backend**.
3. Backend:
   - Stores uploaded files inside **uploads/**
   - Saves metadata (filename, size, created_at) in **SQLite database**
4. Frontend fetches document list via API.
5. Download requests stream the file to the user.
6. Delete requests remove files + DB entry.

---

# 🔄 5. Data Flow Description

## **When uploading a PDF**
1. User selects or drags a file into the frontend.
2. Frontend sends it to `/documents/upload` via FormData.
3. Backend (multer) validates type & size.
4. File saved in `uploads/` folder.
5. Metadata inserted into SQLite DB.
6. Frontend refreshes the list.

## **When downloading**
1. User clicks **Download**.
2. Frontend sends GET `/documents/:id`.
3. Backend finds file path from DB.
4. Backend streams the file to browser.

---

# 📘 6. Assumptions

- Only **PDFs** allowed  
- Max file size: **10 MB**  
- Single user (no login required)  
- SQLite is sufficient for assignment  
- Local file storage acceptable  
- No cloud / no scaling required for demo  

---

# 📈 7. Scaling to 1,000 Users

If required for production:

- Move from SQLite → PostgreSQL  
- Use AWS S3 for file storage  
- Add authentication + `user_id` column  
- Deploy backend with load balancers  
- Use Redis caching  
- Add logging, monitoring, rate limiting  

---

# 🎨 8. Features Completed

## **Frontend**
✔ PDF upload (with validation)  
✔ File listing  
✔ Download button  
✔ Delete button  
✔ Clean UI  

## **Backend**
✔ File upload with multer  
✔ Save to `uploads/`  
✔ Metadata saved to SQLite  
✔ APIs for upload/list/download/delete  

---

# 📎 9. Contact

Prepared by: Siddarth S Mallik  
Email: **siddarthsmalliksiddusmallik@gmail.com**  
Phone: **+91 7483780500**




