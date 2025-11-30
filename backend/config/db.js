import mongoose from "mongoose";
const DBNAME = "ROOTVESTORS"
const ConnectDB = async () =>{
    try {
        const ConnectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DBNAME}`)
        console.log("DB connected successfully");
        
    } catch (error) {
        console.log("Error connecting to the database",error);
        process.exit(1) ; 
    }
}

export {ConnectDB}