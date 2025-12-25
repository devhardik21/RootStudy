import mongoose from "mongoose";

/**
 * Schema for storing metadata of uploaded pages
 * Only pages that are actually dropped onto the canvas are stored here
 */
const UploadedPageSchema = new mongoose.Schema(
    {
        pageNumber: {
            type: Number,
            required: true
        },
        thumbnailUrl: {
            type: String,
            required: true  // Low-res thumbnail URL from Cloudinary
        },
        highResUrl: {
            type: String,
            required: true  // High-res page URL from Cloudinary
        }
    },
    { _id: false }
);

/**
 * Main PDF Document Schema
 * Stores metadata about uploaded PDFs and tracks which pages have been rendered
 */
const PdfDocumentSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pages',  // Links to your existing Pages model
            required: false
        },
        fileName: {
            type: String,
            required: true
        },
        fileSize: {
            type: Number,
            required: true  // Size in bytes
        },
        totalPages: {
            type: Number,
            required: true
        },
        uploadedPages: [UploadedPageSchema],  // Only pages dropped on canvas
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

/**
 * Index for faster queries by projectId
 */
PdfDocumentSchema.index({ projectId: 1 });

const PdfDocument = mongoose.model("PdfDocument", PdfDocumentSchema);

export { PdfDocument, UploadedPageSchema };
