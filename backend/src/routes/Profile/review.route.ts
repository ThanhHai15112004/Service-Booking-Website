import { Router } from "express";
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getUserHotelReview
} from "../../controllers/Profile/review.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateJWT, getReviews);
router.get("/hotel/:hotelId", authenticateJWT, getUserHotelReview); // Must be before /:reviewId
router.get("/:reviewId", authenticateJWT, getReviewById);
router.post("/", authenticateJWT, createReview);
router.put("/:reviewId", authenticateJWT, updateReview);
router.delete("/:reviewId", authenticateJWT, deleteReview);

export default router;


