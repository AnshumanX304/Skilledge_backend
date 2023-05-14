const mongoose=require('mongoose');
const vidSchema=mongoose.Schema({
    courseid:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"courseModel"
    },
    lesson:{
        type:String,
        required:true
    },
    vidpath:{
        type:String,
        required:true
    }
})

const vidModel=mongoose.model('vidModel',vidSchema);
module.exports=vidModel;