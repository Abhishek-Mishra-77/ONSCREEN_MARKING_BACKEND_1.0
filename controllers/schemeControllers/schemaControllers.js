import Schema from "../../models/schemeModel/schema.js";

// Create Schema
const createSchema = async (req, res) => {
    const { name, totalQuestions, maxMarks, minMarks, compulsoryQuestions, evaluationTime, isActive } = req.body;

    try {
        // Check if all required fields are present
        if (!name || !totalQuestions || !maxMarks || !minMarks || !evaluationTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate totalQuestions, maxMarks, minMarks
        if (totalQuestions <= 0) {
            return res.status(400).json({ message: "Total questions must be greater than 0" });
        }
        if (maxMarks <= 0) {
            return res.status(400).json({ message: "Max marks must be greater than 0" });
        }
        if (minMarks < 0 || minMarks > maxMarks) {
            return res.status(400).json({ message: "Minimum marks should be between 0 and max marks" });
        }

        const newSchema = new Schema({
            name,
            totalQuestions,
            maxMarks,
            minMarks,
            compulsoryQuestions,
            evaluationTime,
            isActive,
        });

        const savedSchema = await newSchema.save();
        return res.status(201).json(savedSchema);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred while creating the schema." });
    }
};

// Update Schema
const updateSchema = async (req, res) => {
    const { id } = req.params;
    const { name, totalQuestions, maxMarks, minMarks, compulsoryQuestions, evaluationTime, isActive } = req.body;

    try {
        // Validate the input fields
        if (!name || !totalQuestions || !maxMarks || !minMarks || !evaluationTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (totalQuestions <= 0) {
            return res.status(400).json({ message: "Total questions must be greater than 0" });
        }
        if (maxMarks <= 0) {
            return res.status(400).json({ message: "Max marks must be greater than 0" });
        }
        if (minMarks < 0 || minMarks > maxMarks) {
            return res.status(400).json({ message: "Minimum marks should be between 0 and max marks" });
        }

        // Find schema by id and update it
        const schema = await Schema.findById(id);
        if (!schema) {
            return res.status(404).json({ message: "Schema not found." });
        }

        schema.name = name;
        schema.totalQuestions = totalQuestions;
        schema.maxMarks = maxMarks;
        schema.minMarks = minMarks;
        schema.compulsoryQuestions = compulsoryQuestions;
        schema.evaluationTime = evaluationTime;
        schema.isActive = isActive;

        const updatedSchema = await schema.save();
        return res.status(200).json(updatedSchema);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while updating the schema." });
    }
};

// Get Schema By ID
const getSchemaById = async (req, res) => {
    const { id } = req.params;
    try {
        const schema = await Schema.findById(id);
        if (!schema) {
            return res.status(404).json({ message: "Schema not found." });
        }
        return res.status(200).json(schema);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while retrieving the schema." });
    }
};

// Get All Schemas
const getAllSchemas = async (req, res) => {
    try {
        const schemas = await Schema.find();
        return res.status(200).json(schemas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while retrieving the schemas." });
    }
};

// Remove Schema
const removeSchema = async (req, res) => {
    const { id } = req.params;
    try {
        const schema = await Schema.findByIdAndDelete(id);
        if (!schema) {
            return res.status(404).json({ message: "Schema not found." });
        }
        return res.status(200).json({ message: "Schema successfully removed." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while removing the schema." });
    }
};

export { createSchema, updateSchema, getSchemaById, getAllSchemas, removeSchema };
