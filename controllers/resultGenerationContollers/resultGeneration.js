import fs from "fs";
import path from "path";
import csvToJson from "../../services/csvToJson.js";
import convertJSONToCSV from "../../services/jsonToCsv.js";
import Marks from "../../models/EvaluationModels/marksModel.js";
import Task from "../../models/taskModels/taskModel.js";
import AnswerPdf from "../../models/EvaluationModels/studentAnswerPdf.js";
import { __dirname } from "../../server.js";

const generateResult = async (req, res) => {
    const { subjectcode } = req.body;
    const uploadedCsv = req.file;

    try {
        if (!subjectcode) {
            return res.status(400).json({ message: "Subject code is required." });
        }

        if (!uploadedCsv) {
            return res.status(400).json({ message: "No CSV file uploaded." });
        }

        // Create necessary folders
        const resultFolder = path.join(__dirname, "resultFolder", subjectcode);
        const tempFolder = path.join(__dirname, "temp");
        if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });
        if (!fs.existsSync(resultFolder)) fs.mkdirSync(resultFolder, { recursive: true });

        // Save uploaded CSV temporarily
        const tempCsvPath = path.join(tempFolder, uploadedCsv.originalname);
        fs.writeFileSync(tempCsvPath, fs.readFileSync(uploadedCsv.path));

        // Convert uploaded CSV to JSON
        const csvData = await csvToJson(tempCsvPath);

        // Fetch tasks and generate results
        const tasks = await Task.find({ subjectCode: subjectcode }).populate("userId", "email");
        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found." });
        }

        // Map taskId to user email
        const userMap = tasks.reduce((map, task) => {
            if (task.userId && task.userId.email) {
                map[task._id] = task.userId.email;
            }
            return map;
        }, {});

        const taskIds = tasks.map((task) => task._id);
        const completedBooklets = await AnswerPdf.find({ taskId: { $in: taskIds }, status: true });

        if (completedBooklets.length === 0) {
            return res.status(404).json({ message: "No completed booklets found." });
        }

        const generatingResults = await Promise.all(
            completedBooklets.map(async (booklet) => {
                const barcode = booklet.answerPdfName?.split("_")[0];
                if (!barcode) {
                    return {
                        status: "false",
                        message: "Barcode name not found",
                        bookletName: booklet.answerPdfName,
                        barcode: "",
                    };
                }

                const marks = await Marks.find({ answerPdfId: booklet._id });
                const totalMarks = marks.reduce((sum, mark) => sum + mark.allottedMarks, 0);

                // Get evaluator's email from the userMap
                const evaluatedBy = userMap[booklet.taskId] || "Unknown";

                return {
                    status: "true",
                    barcode: barcode,
                    totalMarks: totalMarks,
                    evaluatedBy: evaluatedBy,
                };
            })
        );

        console.log(generatingResults)

        // Match barcodes from the CSV with generatingResults
        const finalResults = csvData.map((row) => {
            const matchingResult = generatingResults.find(
                (result) => result.barcode === row.BARCODE
            );

            if (matchingResult) {
                return {
                    ...row,
                    MARKS: matchingResult.totalMarks,
                    EVALUATEDBY: matchingResult.evaluatedBy,
                };
            }
            return {
                ...row,
                MARKS: "N/A",
                EVALUATEDBY: "N/A",
            };
        });

        // Convert final results to CSV
        const newCsvData = convertJSONToCSV(finalResults);
        if (!newCsvData) {
            return res.status(500).json({ message: "Failed to generate CSV." });
        }

        const resultCsvPath = path.join(resultFolder, "result.csv");
        fs.writeFileSync(resultCsvPath, newCsvData);

        // Clean up temp folder
        fs.rmSync(tempFolder, { recursive: true, force: true });

        // Send JSON response to the frontend
        return res.status(200).json({
            message: "Results generated successfully.",
            data: finalResults,
            csvSavedPath: resultCsvPath,
        });
    } catch (error) {
        console.error("Error generating results:", error);
        return res.status(500).json({ message: "Failed to generate result", error: error.message });
    }
};

const getPreviousResult = async (req, res) => {
    const { subjectcode } = req.query;

    try {
        if (!subjectcode) {
            return res.status(400).json({ message: "Subject code is required." });
        }

        const resultFolderPath = path.join(__dirname, "resultFolder", subjectcode);

        if (!fs.existsSync(resultFolderPath)) {
            return res.status(404).json({ message: "No results found for this subject code." });
        }

        const files = fs.readdirSync(resultFolderPath);
        if (files.length === 0) {
            return res.status(404).json({ message: "No results found for this subject code." });
        }

        const results = files.map((filename) => {
            const filePath = path.join(resultFolderPath, filename);
            const stats = fs.statSync(filePath);

            return {
                filename: filename,
                time: stats.mtime.toISOString(),
            };
        });

        return res.status(200).json({ results });
    } catch (error) {
        console.error("Error retrieving previous results:", error);
        return res.status(500).json({ message: "Failed to retrieve results", error: error.message });
    }
};

const downloadResultByName = async (req, res) => {
    const { subjectcode, filename } = req.query;

    try {
        if (!subjectcode || !filename) {
            return res.status(400).json({ message: "Subject code and filename are required." });
        }

        const resultFolderPath = path.join(__dirname, "resultFolder", subjectcode);

        if (!fs.existsSync(resultFolderPath)) {
            return res.status(404).json({ message: "No results found for this subject code." });
        }

        const filePath = path.join(resultFolderPath, filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Result file not found." });
        }

        const result = await csvToJson(filePath);

        return res.status(200).json({ result });

    } catch (error) {
        console.error("Error downloading result:", error);
        return res.status(500).json({ message: "Failed to download result", error: error.message });
    }
};

export { generateResult, getPreviousResult, downloadResultByName };
