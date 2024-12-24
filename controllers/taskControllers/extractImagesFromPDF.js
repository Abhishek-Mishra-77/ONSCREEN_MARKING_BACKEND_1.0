import fs from 'fs';
import path from 'path';
import pdfPoppler from 'pdf-poppler';

const extractImagesFromPDF = async (pdfPath, outputFolder) => {
    try {
        const options = {
            format: 'png',
            out_dir: outputFolder,
            out_prefix: 'image',
            page: null,
        };

        // Ensure the output folder exists
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }

        // Run the extraction
        await pdfPoppler.convert(pdfPath, options);

        // Return the list of image files extracted
        const imageFiles = fs.readdirSync(outputFolder).filter(file => path.extname(file) === '.png');
        const imagePaths = imageFiles.map(file => path.join(outputFolder, file)); // Return full paths
        return imagePaths;
    } catch (error) {
        console.error(`Error extracting images from PDF ${pdfPath}:`, error);
        return [];
    }
};

export default extractImagesFromPDF;
