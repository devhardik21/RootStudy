import { StudentGroup } from "../models/group.model.js";

const GetAllGroups = async (req , res) => {
    try {
        const groups = await StudentGroup.find()

        return res.status(200).json({
            message : "List of all the groups",
            groups
        })
    
    } catch (error) {
        console.log(`directly to the catch block of get groups ${error.message}`);
        
    }
    
}

export {GetAllGroups}