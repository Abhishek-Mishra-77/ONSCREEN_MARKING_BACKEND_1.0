import express from "express";
const router = express.Router();
import { processingBooklets } from "../../controllers/bookletsProcessing/bookletsProcessing.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";


router.post('/processing', processingBooklets);


export default router;

