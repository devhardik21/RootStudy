import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { PdfDocument } from '../models/pdf.model.js';
import { UploadOnCloudinary } from '../utils/cloudinary.utils.js';
import fs from 'fs';

// Configuration constants
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_PAGES = 50;
const THUMBNAIL_WIDTH = 200; // pixels
const HIGH_RES_WIDTH = 1200; // pixels

/**
 * Upload PDF and extract metadata
 * @route POST /api/pdf/upload
 */
export const uploadPdf = async (req, res) => {
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded'
            });
        }

        const file = req.file;

        // Validate file type
        if (file.mimetype !== 'application/pdf') {
            fs.unlinkSync(file.path); // Clean up
            return res.status(400).json({
                success: false,
                message: 'Only PDF files are allowed'
            });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: `PDF file size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
            });
        }

        // Load PDF to get metadata
        const pdfBytes = fs.readFileSync(file.path);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        // Validate page count
        if (totalPages > MAX_PAGES) {
            fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: `PDF must have less than ${MAX_PAGES} pages`
            });
        }

        // Save PDF metadata to database
        const pdfDocument = new PdfDocument({
            fileName: file.originalname,
            fileSize: file.size,
            totalPages: totalPages,
            projectId: req.body.projectId || null,
            uploadedPages: []
        });

        await pdfDocument.save();

        // Clean up uploaded file (we don't store the actual PDF)
        fs.unlinkSync(file.path);

        return res.status(200).json({
            success: true,
            message: 'PDF uploaded successfully',
            data: {
                pdfId: pdfDocument._id,
                fileName: pdfDocument.fileName,
                totalPages: pdfDocument.totalPages,
                fileSize: pdfDocument.fileSize
            }
        });

    } catch (error) {
        console.error('Error uploading PDF:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: 'Error processing PDF',
            error: error.message
        });
    }
};

/**
 * Render specific PDF page and upload to Cloudinary
 * @route POST /api/pdf/render-page
 */
export const renderPdfPage = async (req, res) => {
    try {
        const { pdfId, pageNumber, quality } = req.body;

        // Validate inputs
        if (!pdfId || !pageNumber) {
            return res.status(400).json({
                success: false,
                message: 'PDF ID and page number are required'
            });
        }

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded'
            });
        }

        const file = req.file;

        // Verify PDF document exists in database
        const pdfDocument = await PdfDocument.findById(pdfId);
        if (!pdfDocument) {
            fs.unlinkSync(file.path);
            return res.status(404).json({
                success: false,
                message: 'PDF document not found'
            });
        }

        // Validate page number
        if (pageNumber < 1 || pageNumber > pdfDocument.totalPages) {
            fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: `Invalid page number. PDF has ${pdfDocument.totalPages} pages`
            });
        }

        // Check if page already rendered
        const existingPage = pdfDocument.uploadedPages.find(
            p => p.pageNumber === parseInt(pageNumber)
        );

        if (existingPage) {
            fs.unlinkSync(file.path);
            return res.status(200).json({
                success: true,
                message: 'Page already rendered',
                data: {
                    pageNumber: existingPage.pageNumber,
                    thumbnailUrl: existingPage.thumbnailUrl,
                    highResUrl: existingPage.highResUrl
                }
            });
        }

        // Load PDF and extract the specific page
        const pdfBytes = fs.readFileSync(file.path);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Create a new PDF with only the requested page
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
        newPdfDoc.addPage(copiedPage);
        
        const singlePageBytes = await newPdfDoc.save();
        
        // We'll need to convert PDF page to image
        // For now, we'll upload the PDF page itself and let frontend handle rendering
        // In production, you might use a service like Poppler or pdf2pic
        
        // Save single page as temporary file
        const tempPagePath = `${file.path}-page${pageNumber}.pdf`;
        fs.writeFileSync(tempPagePath, singlePageBytes);

        // Upload to Cloudinary (using existing utility)
        const uploadResult = await UploadOnCloudinary(tempPagePath);
        
        // Clean up temporary files
        fs.unlinkSync(file.path);
        fs.unlinkSync(tempPagePath);

        // Store page information
        pdfDocument.uploadedPages.push({
            pageNumber: parseInt(pageNumber),
            thumbnailUrl: uploadResult.secure_url,
            highResUrl: uploadResult.secure_url
        });

        await pdfDocument.save();

        return res.status(200).json({
            success: true,
            message: 'Page rendered successfully',
            data: {
                pageNumber: parseInt(pageNumber),
                thumbnailUrl: uploadResult.secure_url,
                highResUrl: uploadResult.secure_url
            }
        });

    } catch (error) {
        console.error('Error rendering PDF page:', error);
        
        // Clean up files if they exist
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: 'Error rendering PDF page',
            error: error.message
        });
    }
};

/**
 * Get PDF document details
 * @route GET /api/pdf/:pdfId
 */
export const getPdfDocument = async (req, res) => {
    try {
        const { pdfId } = req.params;

        const pdfDocument = await PdfDocument.findById(pdfId);
        
        if (!pdfDocument) {
            return res.status(404).json({
                success: false,
                message: 'PDF document not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: pdfDocument
        });

    } catch (error) {
        console.error('Error fetching PDF document:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching PDF document',
            error: error.message
        });
    }
};
