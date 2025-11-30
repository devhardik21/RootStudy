import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema(
    {
        type:
        {
            type: String,
            enum: ['pdf', 'audio'],
            required: false
        },
        url: { type: String, required: false },
    }, { _id: false });

const PageSchema = new mongoose.Schema({
    pageName: {
        required: true,
        type: String
    },
    pageImage: {
        required: true,
        type: String
    },
    attachments: [AttachmentSchema],
    sentGroups :[{
    type : mongoose.Schema.Types.ObjectId , 
    ref: 'StudentGroup'
    }]

}, { timestamps: true }
)

const Pages = mongoose.model("Pages",PageSchema)

export { Pages , AttachmentSchema}