const mongoose=require('mongoose');
const courseSchema=mongoose.Schema({
    educatorid:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"UserModel"
    },
    imgpath:{
        type:String,
        default:"uploads/cardimage.png"
        
    },
    topic:{
        type:String,
      
    },
    description:{
        type:String,

    },
    categories:{
        type:String
    },
    price:{
        type:Number
    },
    lesson:{
        type:String
    },
    vidpath:{
        type:String,
        default:"uploads/samplevideo.mp4"
       
    }

})
const courseModel=mongoose.model("courseModel",courseSchema);
module.exports=courseModel;
