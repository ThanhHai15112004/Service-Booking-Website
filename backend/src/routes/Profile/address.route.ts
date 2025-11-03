import { Router } from "express";
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress
} from "../../controllers/Profile/address.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateJWT, getAddresses);
router.get("/:addressId", authenticateJWT, getAddressById);
router.post("/", authenticateJWT, createAddress);
router.put("/:addressId", authenticateJWT, updateAddress);
router.delete("/:addressId", authenticateJWT, deleteAddress);

export default router;


