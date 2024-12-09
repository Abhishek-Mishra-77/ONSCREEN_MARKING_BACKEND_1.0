import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

const extractImagesFromPdf = async (pdfPath, outputDir) => {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    let imageCounter = 1;

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const images = page.getImages();

        for (let j = 0; j < images.length; j++) {
            const image = images[j];
            const outputImagePath = path.join(outputDir, `image${imageCounter}.png`);
            fs.writeFileSync(outputImagePath, image.bytes);
            imageCounter++;
        }
    }

    return imageCounter - 1; 
};


export default extractImagesFromPdf;
