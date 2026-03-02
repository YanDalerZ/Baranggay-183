import multer from 'multer';
// Using memoryStorage to support BLOB uploads for Render/Aiven
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Define allowed types: Images and Documents
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf', // .pdf
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only .jpg, .png, .webp, .pdf, .doc, and .docx formats are allowed!'), false);
    }
};
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit per file
    }
});
//# sourceMappingURL=uploadMiddleware.js.map