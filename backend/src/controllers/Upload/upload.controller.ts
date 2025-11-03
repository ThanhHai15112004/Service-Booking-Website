import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads');
    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file: timestamp + random + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

// Filter chỉ cho phép file ảnh
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const extname = allowedTypes.test(ext);
  const mimetype = file.mimetype && allowedTypes.test(file.mimetype.toLowerCase());

  // Debug logging
  if (!mimetype || !extname) {
    console.log('[Upload] File rejected:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extname: ext,
      extnameMatch: extname,
      mimetypeMatch: mimetype
    });
  }

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP). File hiện tại: ${file.originalname}, MIME type: ${file.mimetype || 'unknown'}`));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// Controller upload ảnh đơn
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Không có file được upload"
      });
    }

    // Tạo URL để truy cập ảnh (giả sử serve static files từ /uploads)
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        imageUrl: imageUrl, // Frontend expects imageUrl
        url: imageUrl, // Also keep url for backward compatibility
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: "Upload ảnh thành công"
    });
  } catch (err: any) {
    // Check if it's a multer file filter error
    if (err.message && (err.message.includes('Chỉ cho phép') || err.message.includes('JPEG') || err.message.includes('PNG'))) {
      return res.status(400).json({
        success: false,
        message: err.message || "Định dạng ảnh không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP."
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi upload ảnh"
    });
  }
};

// Controller upload nhiều ảnh
export const uploadImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Không có file được upload"
      });
    }

    // Handle both array of files and single file object
    let files: Express.Multer.File[] = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else {
      // If req.files is an object with multiple fields, flatten it
      files = Object.values(req.files).flat();
    }

    const uploadedFiles = files.map((file: Express.Multer.File) => ({
      filename: file.filename,
      originalname: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      data: uploadedFiles,
      message: `Upload thành công ${uploadedFiles.length} ảnh`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi upload ảnh"
    });
  }
};

