const mongoose=require('mongoose');

const dbconnection=async()=>{
    try{
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.dbconfig,()=>{
            console.log("db connection successful");
        });
    }
    catch(err){
        console.log(err);
    }
};
module.exports=dbconnection;