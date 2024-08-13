import {MongoClient, ServerApiVersion} from "mongodb";
// const uri = "mongodb+srv://yashgoswamiyg2003:yash1234@cluster0.mttpnyr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = 'mongodb://yashgoswamiyg2003:yash1234@ac-b6w0rxz-shard-00-00.mttpnyr.mongodb.net:27017,ac-b6w0rxz-shard-00-01.mttpnyr.mongodb.net:27017,ac-b6w0rxz-shard-00-02.mttpnyr.mongodb.net:27017/?ssl=true&replicaSet=atlas-3qu3bz-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0'


export class Database{
    constructor() {
        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
    }
    async getProfile(filter_) {
        try {
            let database_ = this.client.db('Portal') ;
            return await database_.collection('profiles').findOne(filter_);
        } catch (error) {
            console.log(error);
        }
    }
    async AddEmployee(Employee_Details) {
        try {
            let database_ = this.client.db('Portal') ;
            await database_.collection('Managers').insertOne({
                ManagerID : Employee_Details["Admin Permission"].manager,
                EmployeeID : Employee_Details.employeeID
            })
            await database_.collection('profiles').insertOne(Employee_Details);
        } catch (error) {
            console.log(error);
        }
    }
    async TeamMembers(employee) {
        try {
            let database_ = this.client.db('Portal') ;
            return await Promise.all((await database_.collection('Managers').find({
                ManagerID : employee.ManagerID
            }).toArray()).map(async (employee)=>{
                return await this.getProfile({employeeID : employee.EmployeeID})
            }));
        } catch (error) {
            console.log(error);
        }
    }
    async AuthenticateEmployee(Employee_Details) {
        try {
            let database_ = this.client.db('Portal') ;
            return await database_.collection('profiles').findOne(Employee_Details);
        } catch (error) {
            console.log(error);
        }
    }
    async UpdateEmployee(Employee_Details) {
        try {
            let database_ = this.client.db('Portal') ;
            return await database_.collection('profiles').updateOne({employeeID: Employee_Details.employeeID, employeePassword: Employee_Details.employeePassword}, {$set: Employee_Details});
        } catch (error) {
            console.log(error);
        }
    }
    async RequestAttendence(Employee_Details){
        try {
            let database_ = this.client.db('Portal') ;
            return await database_.collection('attendance').insertOne({
                ...Employee_Details,
                status : 'pending'
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async AcceptAttendence(Employee_Details){
        try {
            let database_ = this.client.db('Portal') ;
            return await database_.collection('attendance').updateOne({id : Employee_Details.id},{$set : {status : 'present'}});
        }
        catch (error) {
            console.log(error);
        }
    }
    async GetAttendenceRequests(Employee_Details){
        try {
            let database_ = this.client.db('Portal') ;
            return Promise.all((await database_.collection('attendance').find({
                managerID : Employee_Details.employeeID,
                status : 'pending'
            }).toArray()).map(async req=>{
                return {
                    ...req,
                    name : (await this.getProfile({employeeID : req.employeeID})).Personal.firstname + ' ' + (await this.getProfile({employeeID : req.employeeID})).Personal.lastname
                }
            }));
        }
        catch (error) {
            console.log(error);
        }
    }
    async GetAttendence(Employee_Details){
        try {
            let database_ = this.client.db('Portal') ;
            console.log(7828,Employee_Details)
            return await database_.collection('attendance').find({
                employeeID : Employee_Details.employeeID,
                status : 'present'
            }).toArray();
        }
        catch (error) {
            console.log(error);
        }
    }
    async RequestLeave(employee_details)
    {
        try {
            let database_ = this.client.db('Portal') ;
            let Leave_ = database_.collection('Leaves') ;
            return Leave_.insertOne({...employee_details,'status' : 'pending'})
        }
        catch (e)
        {
            console.log(e) ;
        }
    }
    async AcceptLeaveRequest(req)
    {
        try {
            let database_ = this.client.db('Portal') ;
            let Leave_ = database_.collection('Leaves') ;
            let Leave_Request = (await Leave_.findOne({id : req.leave_id})) ;
            let manager = Leave_Request.managerID ;
            let employee = Leave_Request.employeeID ;
            if (manager == req.managerID)
            {
                await Leave_.updateOne({id : req.leave_id},{$set : {status : req.permission ? 'accepted' : 'rejected'}})
                if (req.permission)
                {
                    let profile = database_.collection('profiles') ;
                    let start_date = new Date(Leave_Request.start) ;
                    let end_date = new Date(Leave_Request.end) ;
                    let time_ = start_date.getTime() - end_date.getTime() ;
                    let days = Math.floor(time_ / (1000 * 3600 * 24)) -1 ;
                    if ((await profile.findOne({employeeID : employee})).Leaves[Leave_Request.type] < -days)
                    {
                        return {
                            leave_id : req.leave_id,
                            status : 'You dont Have enough leaves'
                        }
                    }
                    await profile.updateOne({employeeID : employee},{
                        $inc : {
                            [`Leaves.${Leave_Request.type}`] : days
                        }
                    })
                    return {
                        leave_id : req.leave_id,
                        status : 'accepted'
                    }
                }
                else {
                    return {
                        leave_id : req.leave_id,
                        status : 'rejected'
                    }
                }
            }
            else
            {
                return {
                    leave_id : req.leave_id,
                    status : 'not allowed'
                }
            }}
        catch (e)
        {
            console.log(e) ;
        }
    }
    async getLeaves(employee) {
        try {
            let database_ = this.client.db('Portal') ;
            return await Promise.all((await database_.collection('Leaves').find({
                managerID : employee.ManagerID,
                status : 'pending'
            }).toArray()).map(async (leave)=>{
                let profile  =await database_.collection('profiles').findOne({employeeID : leave.employeeID})
                leave = {
                    ...leave,
                    name : profile.Personal.firstname + ' ' + profile.Personal.lastname,
                    role : profile.Employment.role
                }
                return leave
            }));
        } catch (error) {
            console.log(error);
        }
    }
    async GetFiles() {
        try {
            let database_ = this.client.db('Portal') ;
            return await database_.collection('documents').find({}).toArray();
        } catch (error) {
            console.log(error);
        }
    }
    async SearchDocument(req)
    {
        try {
            let database_ = this.client.db('Portal') ;
            return await database_.collection('documents').find(
                {
                    description : {
                        $regex : (new RegExp(req.desp,'i'))
                    }
                }
            ).toArray();
        } catch (error) {
            console.log(error);
        }
    }
    async getFileDownload(id) {
        try {
            let database_ = this.client.db('Portal') ;
            return await database_.collection('uploads').findOne(
                {
                    id : id
                }
            );
        } catch (error) {
            console.log(error);
        }
    }
    async FileUpload(req) {
        try {
            let database_ = this.client.db('Portal') ;
            console.log(req.file)
            const fileDoc = {
                filename: req.file.originalname,
                id : req.id,
                contentType: req.file.mimetype,
                size: req.file.size,
                uploadDate: new Date(),
                content: req.file.buffer
            }
            await database_.collection('uploads').insertOne(fileDoc);
            return await database_.collection('documents').insertOne({
                filename: req.file.originalname,
                description : req.body.desp,
                id : req.id,
                contentType: req.file.mimetype,
                size: req.file.size,
                uploadDate: new Date(),
            })
        } catch (error) {
            console.log(error);
        }
    }
    async connect() {
        try {
            await this.client.connect();
            console.log('Connected to MongoDB');
        }
        catch (error) {
            console.log(error);
        }
    }
    async destroy() {
        await this.client.close();
        console.log('Connection closed');
    }

}
