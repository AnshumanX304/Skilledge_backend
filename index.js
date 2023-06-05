const express=require('express');
const dbconnection=require("./dbconnect/dbconnection");
require('dotenv').config();
const app=express();
const bodyParser = require('body-parser');
const CookieParser=require("cookie-parser");
const cors=require('cors');
const videoModel=require("./models/videoModel")
const mongoose=require('mongoose');
const corsOrigin ={
    origin:'http://localhost:3000', //or whatever port your frontend is using
    credentials:true,            
    optionSuccessStatus:200
}
const fs=require('fs');
if(!fs.existsSync('./uploads')){
        fs.mkdirSync('./uploads');
}
app.use(express.static(__dirname + '/public'));

app.use('/uploads', express.static('uploads'));
// const multer=require('multer');
// const storage=multer.diskStorage({
//         destination:(req,res,cb)=>{
//                 cb(null,'images');
//         },
//         filename:(req,file,cb)=>{
//                 console.log(file);
//                 cb(null,Date.now()+path.extname(file.originalname))
//         }
// })
// const upload=multer({storage:storage});
app.use(cors(corsOrigin));
dbconnection();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(CookieParser());
app.get('/user/watchvideos/:id',async (req,res)=>{
        try{
                let id=req.params.id;
                const _id=mongoose.Types.ObjectId(id);
                const vidDetails=await videoModel.findById(_id);
                const vidpath=vidDetails.vidpath;
                if(!vidpath){
                        throw new Error('no such video found !');
                }
                const stat=fs.statSync(vidpath);
                // console.log(stat);
                const fileSize=stat.size;
                const range=req.headers.range;
                // console.log(range);
                if(range){
                        const parts = range.replace(/bytes=/, '').split('-')
                        const start = parseInt(parts[0], 10);
                        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                        const chunksize = end - start + 1;
                        const file = fs.createReadStream(vidpath, {start, end});
                        const head = {
                                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                                'Accept-Ranges': 'bytes',
                                'Content-Length': chunksize,
                                'Content-Type': 'video/mp4'
                        };
                        res.writeHead(206, head);
                        file.pipe(res);
                }
                else{
                        const head = {
                            'Content-Length': fileSize,
                            'Content-Type': 'video/mp4'
                        };
                        res.writeHead(200, head);
                        fs.createReadStream(vidpath).pipe(res)
                    }

        }
        catch(err){
                console.log(err);
        }
        
})
app.use('/user',require('./router/userRouter'));

const PORT=process.env.PORT;
app.listen(PORT,()=>{
        console.log(`Listening to the PORT ${PORT}`);
});

