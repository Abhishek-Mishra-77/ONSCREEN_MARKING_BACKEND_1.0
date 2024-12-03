import Subject from "../../models/classModel/subjectModel.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";


const createSubject = async (req, res) => {
    const { name, code, classId } = req.body;
    if (!name || !code || !classId) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {

        if (!isValidObjectId(classId)) {
            return res.status(400).json({ message: "Invalid class ID." });
        }

        const newSubject = new Subject({
            name,
            code,
            classId
        });
        const savedSubject = await newSubject.save();
        return res.status(201).json(savedSubject);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred while creating the subject." });
    }
};


const removeSubject = async (req, res) => {
    const { id } = req.params;
    try {


        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subject ID." });
        }

        const subject = await Subject.findByIdAndDelete(id);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found." });
        }
        return res.status(200).json({ message: "Subject successfully removed." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while removing the subject." });
    }
}

const getSubjectById = async (req, res) => {
    const { id } = req.params;
    try {


        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subject ID." });
        }

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found." });
        }
        return res.status(200).json(subject);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while retrieving the subject." });
    }
}

const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        return res.status(200).json(subjects);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while retrieving the subjects." });
    }
}

const updateSubject = async (req, res) => {
    const { id } = req.params;
    const { name, code } = req.body;
    try {


        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subject ID." });
        }

        const subject = await Subject.findByIdAndUpdate(id, { name, code }, { new: true });
        if (!subject) {
            return res.status(404).json({ message: "Subject not found." });
        }
        return res.status(200).json(subject);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while updating the subject." });
    }
}

const getAllSubjectBasedOnClassId = async (req, res) => {
    const { classId } = req.params;
    try {


        if (!isValidObjectId(classId)) {
            return res.status(400).json({ message: "Invalid class ID." });
        }

        const subjects = await Subject.find({ classId });
        return res.status(200).json(subjects);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while retrieving the subjects." });
    }
}


export { createSubject, removeSubject, getSubjectById, getAllSubjects, updateSubject, getAllSubjectBasedOnClassId };
