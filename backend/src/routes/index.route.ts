import express from "express";
import { SayHello } from "../controllers/test";

const router = express.Router();

router.get("/", SayHello);

export default router;
