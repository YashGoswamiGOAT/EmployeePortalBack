import express from 'express' ;
import cors from 'cors' ;
import {Database} from "./mongo.mjs";
const app = express() ;
import multer from 'multer';
export const upload = multer({
    storage: multer.memoryStorage()
});

app.use(cors()) ;
app.use(express.json()) ;


app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.post('/adddocument',upload.single('doc'),async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    let file_id = 'TXFILE' + Math.floor(Math.random() * 1000000);
    console.log(2314,req.file)
    var response = await database.FileUpload({...req,id : file_id}) ;
    res.send(response==null ? {Auth:false} : {...response,Auth: true});
    await database.destroy();
})
app.post('/searchdocument',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.SearchDocument(req.body) ;
    res.send(response);
    await database.destroy();
})
app.post('/getfiles',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.GetFiles() ;
    res.send(response);
    await database.destroy();
})

app.post('/getfiledownload',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.getFileDownload(req.body.id) ;
    res.set('Content-Type', response.contentType);
    res.set('Content-Disposition', `inline; filename="${response.filename}"`);
    res.send(response.content.buffer) ;
    await database.destroy();
})

app.post('/getdocument',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.GetFiles() ;
    res.send(response);
    await database.destroy();
})

app.post('/authenticate',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.AuthenticateEmployee(req.body) ;
    res.send(response==null ? {Auth:false} : {...response,Auth: true});
    await database.destroy();
})

app.post('/updateemployee',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.UpdateEmployee(req.body) ;
    res.send(response==null ? {Auth:false} : {...response,Auth: true});
    await database.destroy();
})
app.post('/requestattendence',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    let Attendence_ID = 'TXATTEND' + Math.floor(Math.random() * 1000000);
    var response = await database.RequestAttendence({
        ...req.body,
        id : Attendence_ID
    }) ;
    res.send(response==null ? {Auth:false} : {...response,Auth: true});
    await database.destroy();
})
app.post('/acceptattendence',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.AcceptAttendence(req.body) ;
    res.send(response==null ? {Auth:false} : {...response,Auth: true});
    await database.destroy();
})
app.post('/getattendencerequests',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.GetAttendenceRequests(req.body) ;
    res.send(response);
    await database.destroy();
})
app.post('/getattendence',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.GetAttendence(req.body) ;
    res.send(response);
    await database.destroy();
})
app.post('/getTeamMembers',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.TeamMembers(req.body) ;
    res.send(response);
    await database.destroy();
})
app.post('/requestleave',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    let Leave_ID = 'TXLEAVE' + Math.floor(Math.random() * 1000000);
    var response = await database.RequestLeave({
        ...req.body,
        id : Leave_ID
    }) ;
    res.send(response) ;
    await database.destroy() ;
})
app.post('/getleaves',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.getLeaves(req.body) ;
    res.send(response) ;
    await database.destroy() ;
})

app.post('/acceptleaverequest',async (req,res)=>{
    let database = new Database();
    await database.connect() ;
    var response = await database.AcceptLeaveRequest(req.body) ;
    res.send(response) ;
    await database.destroy() ;
})

app.post('/addemployee',upload.single('file'),async (req,res)=>{
    let ID_ = 'TXEMPA' + Math.floor(Math.random() * 1000000);
    let password = 'EMPPASS' + Math.floor(Math.random() * 2400000);
    let database = new Database();
    await database.connect() ;
    console.log(await database.AddEmployee({
        employeeID : ID_,
        employeePassword : password,
        ...req.body,
        admin : req.body['Admin Permission'].admin=='Yes'
    }));
    res.send(await database.getProfile({ employeeID : ID_}));
    await database.destroy();
})

app.listen(3001, async () => {
    console.log('Example app listening on port 3000!')
})