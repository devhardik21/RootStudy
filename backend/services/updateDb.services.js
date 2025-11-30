import { StudentGroup } from '../models/group.model.js';
import { Pages } from '../models/page.models.js';

const DUMMY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="blue" /></svg>';
const DUMMY_IMAGE = 'https://res-console.cloudinary.com/dtkr0ejcb/thumbnails/v1/image/upload/v1753688347/c2FtcGxlcy9jbG91ZGluYXJ5LWdyb3Vw/drilldown';

async function updateDbWithDummyData() {
    // Add dummy groups
    const groupDocs = await StudentGroup.insertMany([
        {
            groupName: 'DSA Group',
            groupImage: DUMMY_IMAGE,
            numberofStudents: 30
        },
        {
            groupName: 'MERN Group',
            groupImage: DUMMY_IMAGE,
            numberofStudents: 45
        },
        {
            groupName: 'Hackathon Group',
            groupImage: DUMMY_IMAGE,
            numberofStudents: 50
        }
    ]);

    // Add dummy pages with SVG image
    await Pages.insertMany([
        {
            pageName: 'Welcome Page',
            pageImage: DUMMY_SVG,
            sentToStudent: true,
            attachments: [],
            sentGroups: [groupDocs[0]._id, groupDocs[1]._id]
        },
        {
            pageName: 'Info Page',
            pageImage: DUMMY_SVG,
            sentToStudent: false,
            attachments: [],
            sentGroups: [groupDocs[2]._id]
        }
    ]);

    console.log("Dummy data inserted successfully !");
    

    return { success: true };
}

export { updateDbWithDummyData };