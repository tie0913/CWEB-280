import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.resolve('database/uploads');

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
        return cb(new Error("Only PDF resumes are allowed"))
    }
    cb(null, true);
}

export const uploadResume = multer({
    storage,
    fileFilter,
    limits: { file: 2 * 1024 * 1024 },
}).single("resume");