// backend/index.js
const express = require('express');
const multer  = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// Serve frontend files (so /frontend/index.html is available)
app.use(express.static(path.join(__dirname, '..')));

// Ensure uploads folder exists (uploads is at project root)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Setup sqlite database (file created inside backend folder)
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));
db.run(`CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  created_at TEXT NOT NULL
)`);

// Configure multer to save files in uploads/ with unique names
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'))
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDFs allowed'));
    }
    cb(null, true);
  }
});

app.use(express.json());

// --- Routes ---

// Upload endpoint
app.post('/documents/upload', (req, res) => {
  // use multer single upload but handle errors explicitly
  const handler = upload.single('file');
  handler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      // Other errors (e.g., file type)
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const { originalname, filename, size } = req.file;
    const created_at = new Date().toISOString();

    db.run(
      'INSERT INTO documents (filename, filepath, filesize, created_at) VALUES (?, ?, ?, ?)',
      [originalname, filename, size, created_at],
      function(err) {
        if (err) return res.status(500).json({ success:false, error: err.message });
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
});

// List documents
app.get('/documents', (req, res) => {
  db.all('SELECT id, filename, filesize, created_at FROM documents ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Download file
app.get('/documents/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT filename, filepath FROM documents WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).send('Server error');
    if (!row) return res.status(404).send('Not found');

    const filePath = path.join(uploadDir, row.filepath);
    // check file exists
    fs.access(filePath, fs.constants.R_OK, (accessErr) => {
      if (accessErr) return res.status(404).send('File not found');
      // use res.download so browser receives correct headers
      res.download(filePath, row.filename, (downloadErr) => {
        if (downloadErr) {
          // If headers already sent, log — otherwise send error
          if (!res.headersSent) return res.status(500).send('Could not download file');
        }
      });
    });
  });
});

// Delete file
app.delete('/documents/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT filepath FROM documents WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });

    const filePath = path.join(uploadDir, row.filepath);

    fs.unlink(filePath, (unlinkErr) => {
      // ignore unlink errors (file may already be missing), but still remove DB row
      db.run('DELETE FROM documents WHERE id = ?', [id], (dbErr) => {
        if (dbErr) return res.status(500).json({ error: dbErr.message });
        res.json({ success: true });
      });
    });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
