// backend/index.js
const express = require('express');
const multer  = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// Serve frontend & other static files from project root
app.use(express.static(path.join(__dirname, '..')));

// Ensure uploads folder exists in project root
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 👉 Open the frontend when the user visits http://localhost:4000/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Create SQLite DB inside backend folder
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.run(`CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  created_at TEXT NOT NULL
)`);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDFs allowed!'));
    }
    cb(null, true);
  }
});

app.use(express.json());

// Upload PDF
app.post('/documents/upload', upload.single('file'), (req, res) => {
  const { originalname, filename, size } = req.file;
  const created_at = new Date().toISOString();

  db.run(
    'INSERT INTO documents (filename, filepath, filesize, created_at) VALUES (?, ?, ?, ?)',
    [originalname, filename, size, created_at],
    function(err) {
      if (err) return res.status(500).json({ success: false, error: err.message });

      res.json({
        success: true,
        document: {
          id: this.lastID,
          filename: originalname,
          filepath: filename,
          filesize: size,
          created_at
        }
      });
    }
  );
});

// List documents
app.get('/documents', (req, res) => {
  db.all('SELECT id, filename, filesize, created_at FROM documents ORDER BY created_at DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Download file
app.get('/documents/:id', (req, res) => {
  const id = req.params.id;

  db.get('SELECT filename, filepath FROM documents WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).send('Server error');
    if (!row) return res.status(404).send('File not found');

    const filePath = path.join(uploadDir, row.filepath);
    res.download(filePath, row.filename);
  });
});

// Delete file
app.delete('/documents/:id', (req, res) => {
  const id = req.params.id;

  db.get('SELECT filepath FROM documents WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'File not found' });

    const filePath = path.join(uploadDir, row.filepath);

    fs.unlink(filePath, () => {
      db.run('DELETE FROM documents WHERE id = ?', [id], (dbErr) => {
        if (dbErr) return res.status(500).json({ error: dbErr.message });

        res.json({ success: true });
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
