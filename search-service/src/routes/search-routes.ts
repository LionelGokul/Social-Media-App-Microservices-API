import { authenticateRequest } from "../middleware/auth-middleware";
import { searchContent } from "../controllers/search-controller";
import express from "express";

const router = express.Router();
router.use(authenticateRequest);

router.get("/", searchContent);

export default router;
