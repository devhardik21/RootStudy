import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { ConnectDB } from "./config/db.js";
import { GetAllGroups } from "./controller/group.controller.js";
import { CreatePage } from "./controller/page.controller.js";
import { upload } from "./middleware/multer.middleware.js";
import { generateText } from "./controller/ai.controller.js";
// import { updateDbWithDummyData } from "./services/updateDb.services.js";
dotenv.config() ; 

const app = express() ; 

app.use(cors()) ; 
app.use(express.json()) ;

ConnectDB() ;

const PORT = process.env.PORT ;
console.log(`Port is ${process.env.PORT} `);

app.get('/',(req ,res)=>{
    res.send(`Backend of RootStudy`) ; 
})

// updateDbWithDummyData()

// to get the list of all the groups
app.get("/api/groups",GetAllGroups) ;
app.post("/api/create-page",upload.array("attachments"),CreatePage) ;
app.post("/api/text",generateText)
// app.post("/api/image",generateImage)
app.listen(PORT,()=>{
    console.log(`The backnend is successfully running on the port ${PORT}`);
    
})
