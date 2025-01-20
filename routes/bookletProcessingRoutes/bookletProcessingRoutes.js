import express from "express";
const router = express.Router();
import { processingBooklets, servingBooklets, removeRejectedBooklets } from "../../controllers/bookletsProcessing/bookletsProcessing.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";


router.post('/processing', processingBooklets);
router.get('/booklet', servingBooklets);
router.delete('/rejected', removeRejectedBooklets);


export default router;

