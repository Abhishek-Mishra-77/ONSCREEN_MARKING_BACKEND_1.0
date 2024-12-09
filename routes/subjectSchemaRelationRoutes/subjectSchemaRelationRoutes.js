import express from 'express';
const router = express.Router();

import {
    createSubjectSchemaRelation,
    getSubjectSchemaRelationById,
    deleteSubjectSchemaRelationById,
    updateSubjectSchemaRelation,
    getAllSubjectSchemaRelationBySubjectId,
    getAllSubjectSchemaRelationBySchemaId
} from "../../controllers/subjectSchemaRelation/subjectSchemaRelation.js"
import { uploadMiddleware } from '../../controllers/subjectSchemaRelation/subjectSchemaRelation.js';
import authMiddleware from "../../Middlewares/authMiddleware.js";

/* -------------------------------------------------------------------------- */
/*                           SUBJECT SCHEMA RELATION ROUTES                    */
/* -------------------------------------------------------------------------- */

router.post('/createsubjectschemarel', uploadMiddleware, createSubjectSchemaRelation);
router.get('/getsubjectbyid/:id', getSubjectSchemaRelationById);
router.delete('/deletesubjectbyid/:id', deleteSubjectSchemaRelationById);
router.put('/updatesubjectbyid/:id', updateSubjectSchemaRelation);
router.get('/getallsubjectbyid/:subjectId', getAllSubjectSchemaRelationBySubjectId);
router.get('/getallschemabyid/:schemaId', getAllSubjectSchemaRelationBySchemaId);


export default router;