import express from 'express';
const router = express.Router();

import {
    createSubjectSchemaRelation,
    getSubjectSchemaRelationById,
    deleteSubjectSchemaRelationById,
    updateSubjectSchemaRelation,
    getAllSubjectSchemaRelationBySubjectId,
    getAllSubjectSchemaRelationBySchemaId,
    getAllSubjectSchemaRelationBySchemaIdAndSubjectId
} from "../../controllers/subjectSchemaRelation/subjectSchemaRelation.js"

import uploadMiddleware from '../../controllers/subjectSchemaRelation/uploadingPdf.js';
import authMiddleware from "../../Middlewares/authMiddleware.js";

/* -------------------------------------------------------------------------- */
/*                           SUBJECT SCHEMA RELATION ROUTES                   */
/* -------------------------------------------------------------------------- */

router.post('/createsubjectschemarel', authMiddleware, uploadMiddleware, createSubjectSchemaRelation);
router.get('/getsubjectbyid/:id', authMiddleware, getSubjectSchemaRelationById);
router.delete('/deletesubjectbyid/:id', authMiddleware, deleteSubjectSchemaRelationById);
router.put('/updatesubjectbyid/:id', authMiddleware, uploadMiddleware, updateSubjectSchemaRelation);
router.get('/getallsubjectbyid/:subjectId', authMiddleware, getAllSubjectSchemaRelationBySubjectId);
router.get('/getallschemabyid/:schemaId', authMiddleware, getAllSubjectSchemaRelationBySchemaId);
router.get('/getallschemabyidandsubjectid/:schemaId/:subjectId', authMiddleware, getAllSubjectSchemaRelationBySchemaIdAndSubjectId);


export default router;