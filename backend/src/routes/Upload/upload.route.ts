import express from "express";
import { uploadImage, uploadImages, upload } from "../../controllers/Upload/upload.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = express.Router();

// Error handling middleware for multer errors
const handleUploadError = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    // Multer file filter errors
    if (err.message && (err.message.includes('Chỉ cho phép') || err.message.includes('JPEG') || err.message.includes('PNG'))) {
      return res.status(400).json({
        success: false,
        message: err.message || "Định dạng ảnh không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP."
      });
    }
    
    // Multer file size errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "Kích thước file quá lớn. Tối đa 10MB."
      });
    }
    
    // Other multer errors
    return res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi upload file"
    });
  }
  next();
};

// Upload ảnh đơn (field name: 'image')
router.post("/single", authenticateJWT, upload.single('image'), handleUploadError, uploadImage);
router.post("/image", authenticateJWT, upload.single('image'), handleUploadError, uploadImage); // Keep for backward compatibility

// Upload nhiều ảnh (field name: 'images')
router.post("/multiple", authenticateJWT, upload.array('images', 10), handleUploadError, uploadImages);
router.post("/images", authenticateJWT, upload.array('images', 10), handleUploadError, uploadImages); // Keep for backward compatibility

export default router;

