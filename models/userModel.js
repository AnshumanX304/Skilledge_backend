const mongoose=require("mongoose");
const userSchema=mongoose.Schema({
    // firstname:{
    //     type:String,
    //     required:true,

    // },
    // lastname:{
    //     type:String,
    //     required:true,

    // },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
      },
      password:{
        type:String,
        required:true,
        unique:true
      }

});

const UserModel=mongoose.model("USER",userSchema);
module.exports=UserModel;