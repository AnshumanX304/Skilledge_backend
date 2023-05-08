const express=require('express');
const dbconnection=require("./dbconnect/dbconnection");
require('dotenv').config();
const app=express();
const bodyParser = require('body-parser');
const CookieParser=require("cookie-parser");
const cors=require('cors');
const corsOrigin ={
    origin:'http://localhost:3000', //or whatever port your frontend is using
    credentials:true,            
    optionSuccessStatus:200
}
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

app.use('/user',require('./router/userRouter'));

const PORT=process.env.PORT;
app.listen(PORT,()=>{
        console.log(`Listening to the PORT ${PORT}`);
});

