const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const UPLOAD_DIR = path.resolve('./database/uploads');

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const safe = file.originalname.replace(/[^a-z0-9_.-]/gi, '_');
        cb(null, Date.now() + '_' + safe);
    },
});

function fileFilter(req, file, cb) {
    const okTypes = ["application/pdf"];
    if (!okTypes.includes(file.mimetype)) {
        const err = new Error("Only PDF resumes are allowed")
        err.code = "Limited File Type"
        return cb(err)
    }
    cb(null, true);
}

const uploadResume = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = {uploadResume}