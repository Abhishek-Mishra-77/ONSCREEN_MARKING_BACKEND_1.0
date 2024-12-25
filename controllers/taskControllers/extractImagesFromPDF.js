// import fs from 'fs';
// import path from 'path';
// import pdfPoppler from 'pdf-poppler';

// const extractImagesFromPDF = async (pdfPath, outputFolder) => {
//     try {
//         const options = {
//             format: 'png',
//             out_dir: outputFolder,
//             out_prefix: 'image',
//             page: null,
//         };

//         // Ensure the output folder exists
//         if (!fs.existsSync(outputFolder)) {
//             fs.mkdirSync(outputFolder, { recursive: true });
//         }

//         // Run the extraction
//         await pdfPoppler.convert(pdfPath, options);

//         // Return the list of image files extracted
//         const imageFiles = fs.readdirSync(outputFolder).filter(file => path.extname(file) === '.png');
//         const imagePaths = imageFiles.map(file => path.join(outputFolder, file)); // Return full paths
//         return imagePaths;
//     } catch (error) {
//         console.error(`Error extracting images from PDF ${pdfPath}:`, error);
//         return [];
//     }
// };

// export default extractImagesFromPDF;


import fs from 'fs';
import path from 'path';
import poppler from 'pdf-poppler';

const extractImagesFromPdf = async (pdfPath, outputDir) => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const options = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
        page: null,
    };

    try {
        await poppler.convert(pdfPath, options);

        const images = fs.readdirSync(outputDir);
        images.forEach((image, index) => {
            const oldPath = path.join(outputDir, image);
            const newPath = path.join(outputDir, `image_${index + 1}.png`);
            fs.renameSync(oldPath, newPath);
        });

        return images.length;
    } catch (error) {
        console.error("Error extracting images from PDF:", error);
        throw new Error("Failed to extract images from PDF.");
    }
};

export default extractImagesFromPdf;
