const mongoose=require('mongoose');
const courseSchema=mongoose.Schema({
    educatorid:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"UserModel"
    },
    imgpath:{
        type:Array,
        default:"uploads/1668831088524-Logo.png"
    },
    topic:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    categories:{
        type:String
    },
    price:{
        type:Number
    }
})
const courseModel=mongoose.model("courseModel",courseSchema);
module.exports=courseModel;
