import { Pages } from '../models/page.models.js'
import { UploadOnCloudinary } from '../utils/cloudinary.utils.js'
import { StudentGroup } from '../models/group.model.js'

const CreatePage = async (req, res) => {
    try {
        const { pageName, pageImage, sentGroups } = req.body;
        let attachments = [];
        let groups = sentGroups ;

        if (typeof groups === "string") {
            groups = JSON.parse(groups);
        }

        const audioTypes = [
            'audio/mpeg',
            'audio/wav',
            'audio/aac',
            'audio/ogg',
            'audio/flac',
            'audio/mp4',
            'audio/webm',
          ];


        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                let type = '';

                if (file.mimetype.includes('application/pdf')) {
                    type = 'pdf';
                }
                else if (audioTypes.includes(file.mimetype)) {
                    type = 'audio';
                }
                else {
                    type = 'unknown';
                }

                let url = await UploadOnCloudinary(file.path);
                url = url.secure_url ; 

                attachments.push({ type, url });
            }
        }
        // Create the page document
        const newPage = await Pages.create({
            pageName,
            pageImage,
            sentGroups:groups,
            attachments
        });

        for (const groupID of groups) {
            const group = await StudentGroup.findById(groupID);
            group.groupAttachments = attachments
            if (group) {
                group.svgAttachments.push(newPage._id);
                await group.save();
            }
        }

        return res.status(201).json({
            message: 'Page created successfully',
            page: newPage
        });
    } catch (error) {
        console.log(`Directly to the catch block of create page ${error} `);
        return res.status(500).json({
            message: `${error}`
        });
    }
}

export {CreatePage}