import mongoose, { model, Schema } from "mongoose";
import { AttachmentSchema } from "./page.models.js";
const StudentGroupSchema = new Schema({

    groupName : {
        type : String , 
        required : true 
    },
    groupImage : {
        type : String , 
        required : false
    },
    numberofStudents : {
        type : Number , 
        default : 50
    },
    svgAttachments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Pages'
        }
    ],
    groupAttachments : [AttachmentSchema]
},{timestamps : true})

const StudentGroup =  model("StudentGroup",StudentGroupSchema) ;

export {StudentGroup} ;