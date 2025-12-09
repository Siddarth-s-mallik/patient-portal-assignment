# design.md — Patient Portal Assignment

## 1. Tech Stack Choices

### Frontend Framework Used and Why
- **Choice:** HTML, CSS, JavaScript  
- **Why:** Simple, lightweight, no setup needed. Perfect for a small assignment UI.

### Backend Framework Used and Why
- **Choice:** Node.js with Express  
- **Why:** Easy to build REST APIs, great file upload support, widely used.

### Database Used and Why
- **Choice:** SQLite  
- **Why:** No installation needed, fast, simple, ideal for local development. Stores metadata efficiently.

### Scaling to 1,000 Users
- Use **PostgreSQL** instead of SQLite  
- Store files in **AWS S3**  
- Add **login/authentication** and store `user_id`  
- Use **Redis caching**  
- Load balancer + multiple backend servers  

---

## 2. Architecture Overview

### Flow
1. User uploads a PDF from the frontend  
2. Backend (Express + Multer) receives the file  
3. File stored in **uploads/** folder  
4. Metadata saved in SQLite  
5. Frontend fetches file list from `/documents`  
6. User can download or delete through the backend  

### Diagram
```
Frontend (HTML/CSS/JS)
        ↓
Upload PDF → Backend (Express API + Multer)
        ↓
Saved in uploads/ folder
        ↓
Metadata stored in SQLite
```

---

## 3. API Specification

### POST /documents/upload
Uploads a PDF file.

**Sample curl:**
```
curl -X POST http://localhost:4000/documents/upload -F "file=@example.pdf"
```

### GET /documents
Returns list of uploaded files.

```
curl http://localhost:4000/documents
```

### GET /documents/:id
Downloads a file.

```
curl -OJ http://localhost:4000/documents/1
```

### DELETE /documents/:id
Deletes the file from storage + DB.

```
curl -X DELETE http://localhost:4000/documents/1
```

---

## 4. Data Flow Description

### When uploading a PDF
1. User selects a file  
2. Frontend sends request to `/documents/upload`  
3. Multer validates file (PDF only)  
4. Backend stores file in `uploads/`  
5. Backend saves metadata (filename, size, created_at) in SQLite  
6. Frontend refreshes document list  

### When downloading
1. User clicks download  
2. Frontend requests `/documents/:id`  
3. Backend finds file path  
4. Backend streams the file  

---

## 5. Assumptions
- Only **PDFs** allowed  
- File size limit = **10 MB**  
- Single user (no authentication required)  
- Local storage acceptable  
- SQLite is enough for the assignment  
- No concurrency or scaling required  

---

## 6. Database Structure

Table: **documents**

| Column     | Type     | Description                     |
|------------|----------|---------------------------------|
| id         | integer  | Primary key                     |
| filename   | text     | Original filename               |
| filepath   | text     | Stored filename in uploads/     |
| filesize   | integer  | File size in bytes              |
| created_at | text     | Upload timestamp                |
