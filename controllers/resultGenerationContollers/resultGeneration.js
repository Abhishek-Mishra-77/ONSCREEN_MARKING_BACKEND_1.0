import fs from "fs";
import path from "path";
import Marks from "../../models/EvaluationModels/marksModel.js";
import Task from "../../models/taskModels/taskModel.js";
import AnswerPdf from '../../models/EvaluationModels/studentAnswerPdf.js';
import csvToJson from '../../services/csvToJson.js';
import convertJSONToCSV from '../../services/jsonToCsv.js';
import { __dirname } from "../../server.js";

const generateResult = async (req, res) => {
    const { subjectcode } = req.body;

    const { csvFilePath } = req.files;

    console.log(csvFilePath);
    

    try {
        // Step 1: Ensure the main resultFolder exists
        const mainDir = path.join(__dirname, '../../..');
        const resultFolderPath = path.join(mainDir, 'resultFolder');

        if (!fs.existsSync(resultFolderPath)) {
            fs.mkdirSync(resultFolderPath, { recursive: true });
        }

        if (!subjectcode || !csvFilePath) {
            return res.status(400).json({ message: "Subject code and CSV file path are required." });
        }

        // Step 2: Parse the uploaded CSV file
        const csvData = await csvToJson(csvFilePath);

        // Step 3: Fetch tasks for the subject code
        const tasks = await Task.find({ subjectCode: subjectcode });
        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found." });
        }

        // Get all AnswerPdfs with status=true for the fetched tasks
        const taskIds = tasks.map((task) => task._id);
        const completedBooklets = await AnswerPdf.find({ taskId: { $in: taskIds }, status: true });

        if (completedBooklets.length === 0) {
            return res.status(404).json({ message: "No completed booklets found." });
        }

        // Step 4: Prepare results
        const results = await Promise.all(
            csvData.map(async (row) => {
                const barcode = row.BARCODE;
                const booklet = completedBooklets.find(b => b.answerPdfName?.startsWith(barcode));

                if (!booklet) {
                    return { ...row, MARKS: 0, EVALUATEDBY: "N/A" };
                }

                // Fetch marks for the current booklet
                const marks = await Marks.find({ answerPdfId: booklet._id });
                const totalMarks = marks.reduce((sum, mark) => sum + mark.allottedMarks, 0);

                return {
                    ...row,
                    MARKS: totalMarks,
                    EVALUATEDBY: "user1, user2"
                };
            })
        );

        // Step 5: Convert results to CSV and save
        const csvOutput = convertJSONToCSV(results);
        const outputDir = path.join(resultFolderPath, subjectcode);
        const outputFilePath = path.join(outputDir, 'results.csv');

        // Ensure the subject code directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write the CSV file, overriding if it exists
        fs.writeFileSync(outputFilePath, csvOutput);

        return res.status(200).json({ message: "Results generated successfully.", filePath: outputFilePath });
    } catch (error) {
        console.error("Error generating results:", error);
        return res.status(500).json({ message: "Failed to generate result", error: error.message });
    }
};

export { generateResult };