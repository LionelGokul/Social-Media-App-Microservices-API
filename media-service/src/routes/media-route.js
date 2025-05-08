const express = require("express");
const { authenticateRequest } = require("../middlewares/auth-middleware");
const { uploadMedia, getAllMedia } = require("../controllers/media-controller");
const { uploadFile } = require("../middlewares/multer-middleware");

const router = express.Router();

// authenticate requests
router.use(authenticateRequest);

router.post("/upload", authenticateRequest, uploadFile, uploadMedia);
router.get("/", authenticateRequest, getAllMedia);

module.exports = router;
