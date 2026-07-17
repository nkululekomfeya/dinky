/*import PDFDocument from 'pdfkit';
import fs from 'fs';

export default async function generateInternalCalibrationPDF({
    gauge,
    calibration,
    outputPath
}) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

        *//* -----------------------
           COMPANY HEADER
        ----------------------- *//*

        
        doc.image('uploads/Selago.png', 50, 40, { width: 100 });

        doc
            .fontSize(20)
            .text('INTERNAL CALIBRATION CERTIFICATE', { align: 'center' });

        doc.moveDown(2);

        *//* -----------------------
           GAUGE DETAILS
        ----------------------- *//*

        doc.fontSize(12);
        doc.text(`Gauge Code: ${gauge.gauge_code}`);
        doc.text(`Description: ${gauge.description || '-'}`);
        doc.text(`Serial Number: ${gauge.serial_number || '-'}`);
        doc.text(`Range: ${gauge.range || '-'}`);
        doc.moveDown();

        *//* -----------------------
           CALIBRATION DETAILS
        ----------------------- *//*

        doc.text(`Calibration Date: ${calibration.calibration_date}`);
        doc.text(`Due Date: ${calibration.due_date || '-'}`);
        doc.text(`Result: ${calibration.result}`);
        doc.text(`Performed By: ${calibration.performed_by}`);
        doc.text(`Master Gauge Used: ${calibration.master_gauge_number}`);
        doc.moveDown();

        *//* -----------------------
           CALIBRATION STEPS
        ----------------------- *//*

        doc.text('Calibration Steps:', { underline: true });
        doc.moveDown(0.5);

        *//*if (Array.isArray(calibration.calibration_steps)) {
            calibration.calibration_steps.forEach((step, index) => {
                doc.text(
                    `${index + 1}. ${step.name} | Target: ${step.target_value} | Actual: ${step.actual_value}`
                );
            });
        }*//*

        if (Array.isArray(calibration.calibration_steps)) {
            calibration.calibration_steps.forEach((step, index) => {
                doc.text(`${index + 1}. ${step}`);
            });
        }


        doc.moveDown(2);

        doc.text('This is an internally generated calibration certificate.', {
            align: 'center'
        });

        doc.end();

        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}
*/

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export default async function generateInternalCalibrationPDF({ gauge, calibration, outputPath }) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });

            const writeStream = fs.createWriteStream(outputPath);
            doc.pipe(writeStream);

            // ---------- COMPANY LOGO ----------
            const logoPath = path.resolve('uploads/dinkylogo.png'); 
            
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 45, { width: 120 });
            }

            doc
                .fontSize(18)
                .text('Internal Calibration Report', 0, 50, { align: 'center' })
                .moveDown(2);

            // ---------- GAUGE DETAILS TABLE ----------
            doc.fontSize(12).text('Gauge Information:', { underline: true });
            doc.moveDown(0.5);

            const infoTable = [
                ['Gauge Code', gauge.gauge_code || '—'],
                ['Description', gauge.description || '—'],
                ['Gauge Type', gauge.verification_type || '—'],
                /*                ['Serial Number', gauge.serial_number || '—'],*/
                ['Size', gauge.gauge_type || '—'],
                ['Performed By', calibration.performed_by || '—'],
                ['Calibration Date', calibration.calibration_date || '—'],
                ['Due Date', calibration.due_date || '—'],
                ['Master Gauge Number', calibration.master_gauge_number || '—'],
            ];

            // Draw table manually
            const startX = 50;
            let startY = doc.y;
            const col1Width = 150;
            const col2Width = 350;
            const rowHeight = 20;

            infoTable.forEach(([label, value]) => {
                doc.rect(startX, startY, col1Width, rowHeight).stroke();
                doc.rect(startX + col1Width, startY, col2Width, rowHeight).stroke();

                doc.text(label, startX + 5, startY + 5, { width: col1Width - 10 });
                doc.text(value, startX + col1Width + 5, startY + 5, { width: col2Width - 10 });

                startY += rowHeight;
            });

            doc.moveDown(2);

            // ---------- CALIBRATION STEPS ----------
            doc.fontSize(12).text('Calibration Steps:', { underline: true });
            doc.moveDown(0.5);

            if (Array.isArray(calibration.calibration_steps) && calibration.calibration_steps.length > 0) {
                calibration.calibration_steps.forEach((step, index) => {
                    doc.text(`${index + 1}. ${step}`, { indent: 20 });
                });
            } else {
                doc.text('No steps provided', { indent: 20 });
            }

            doc.moveDown(2);

            // ---------- IATF Standard Text ----------
            doc.fontSize(10).text(
                'This calibration report complies with IATF 16949:2016 standards for measurement equipment. ' +
                'All calibrations are traceable to national standards and performed under controlled conditions.',
                { align: 'justify' }
            );

            // ---------- FINALIZE PDF ----------
            doc.end();

            writeStream.on('finish', () => {
                resolve();
            });

            writeStream.on('error', (err) => {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
}
