import Schema from "../../models/schemeModel/schema.js";

const createSchema = async (req, res) => {
    const { name, totalQuestions, maxMarks, minMarks } = req.body;

    try {
        if (!name || !totalQuestions || !maxMarks || !minMarks) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newSchema = new Schema({
            name,
            totalQuestions,
            maxMarks,
            minMarks
        });
        const savedSchema = await newSchema.save();
        return res.status(201).json(savedSchema);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred while creating the schema." });
    }
}

const updateSchema = async (req, res) => {
    const { id } = req.params;
    const { name, totalQuestions, maxMarks, minMarks } = req.body;

    try {
        if (!name || !totalQuestions || !maxMarks || !minMarks) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const schema = await Schema.findById(id);
        if (!schema) {
            return res.status(404).json({ message: "Schema not found." });
        }

        schema.name = name;
        schema.totalQuestions = totalQuestions;
        schema.maxMarks = maxMarks;
        schema.minMarks = minMarks;
        const updatedSchema = await schema.save();
        return res.status(200).json(updatedSchema);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while updating the schema." });
    }
}

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
}

const getAllSchemas = async (req, res) => {
    try {
        const schemas = await Schema.find();
        return res.status(200).json(schemas);
    } catch (error) {

        // Return the schema in the response
        console.error(error);
        return res.status(500).json({ message: "An error occurred while retrieving the schemas." });
        // Log any errors and return a 500 response
    }
}

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
}

export { createSchema, updateSchema, getSchemaById, getAllSchemas, removeSchema }