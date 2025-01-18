import express from "express";
const router = express.Router();
import { processingBooklets, bookletsVerification } from "../../controllers/bookletsProcessing/bookletsProcessing.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";


router.post('/processing', processingBooklets);
router.post('/verification', bookletsVerification)


export default router;

