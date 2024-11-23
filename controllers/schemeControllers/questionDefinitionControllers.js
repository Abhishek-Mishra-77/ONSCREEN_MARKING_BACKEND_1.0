import QuestionDefinition from "../../models/schemeModel/questionDefinitionSchema.js";

const createQuestionDifinition = async (req, res) => {
    const {} = req.body;
    
    try {
       
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "An error occurred while creating the question definition." })
    }
}

const updateQuestionDefinition = async (req, res) => { }

const removeQuestionDifinition = async (req, res) => { }

const removeQuestionDifinitionBasedOnSchemeId = async (req, res) => { }

const getQuestionDefinitionById = async (req, res) => { }

const getAllQuestionDefinationBasedOnSchemeId = async (req, res) => { };


export {
    createQuestionDifinition,
    updateQuestionDefinition,
    removeQuestionDifinition,
    removeQuestionDifinitionBasedOnSchemeId,
    getQuestionDefinitionById,
    getAllQuestionDefinationBasedOnSchemeId
}

