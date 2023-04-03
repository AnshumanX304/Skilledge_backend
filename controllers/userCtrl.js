const UserModel=require("../models/userModel");
const otpModel = require("../models/otpModel");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const nodemailer=require("nodemailer");
const otpGenerator = require("otp-generator");
require("dotenv").config();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "skilledgetechnology@gmail.com",
      pass: process.env.password,
    },
  });

const userCtrl={
    register:async(req,res)=>{
        try{
            let{username,email,password}=req.body;
            email=email.toLowerCase();
            const users=await UserModel.findOne({email});
            if(!users){
                const passwordHash = await bcrypt.hash(password, 12);
                const user = UserModel({
                  username,
                  email,   
                  password: passwordHash
                });
                await user.save();
                const mailoptions = {
                    from: "skilledgetechnology@gmail.com",
                    to: email,
                    subject:
                        "Dear Customer, sign up to your Skilledge account is successfull !",
                    html: `
                    <div
                    class="container"
                    style="max-width: 90%; margin: auto; padding-top: 20px; "
                    >
                    <h2>Welcome to the community. ${user.username}</h2>
                    <h4>You hereby declare you a member of Skilledge.</h4>
                    <p style="margin-bottom: 30px;">We are really happy to welcome you to our growing family of learners. Thank you for showing your interest in our platform.</p>
                    </div>
                    `,
                };
                transporter.sendMail(mailoptions, (err, info) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("mail sent");
                }
                });
                const accesstoken = createAccessToken({ id: user._id });
                const refreshtoken = createRefreshToken({ id: user._id });

                res.cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                path: "/user/refresh_token",
                maxAge: 7 * 24 * 60 * 60 * 1000, //7d
                });

                res.status(200).json({
                success: true,
                msg: "Signup successful !",
                id:user._id,
                accesstoken
                });
            }
            else{
                res.status(400).json({ success: false, msg: "User already exists!" });
            }
        }
        catch(error){
            res.status(400).json({success:false,msg:error.message});
            console.log(error);
        }
        
    },
    signin: async (req, res) => {
        try {
          let { email, password } = req.body;
          email = email.toLowerCase();
          const user = await UserModel.findOne({ email });
          if (!user) throw new Error("No user found!");
          const result = await bcrypt.compare(password, user.password);
          if (!result) throw new Error("Invalid credentials!");
    
          const accesstoken = createAccessToken({ id: user._id });
          const refreshtoken = createRefreshToken({ id: user._id });

          res.cookie("refreshtoken", refreshtoken, {
            httpOnly: true,
            path: "/user/refresh_token",
            maxAge: 7 * 24 * 60 * 60 * 1000, //7d
          });

          res.status(200).json({
            success: true,
            msg: "Login successful",
            accesstoken,
            id:user._id
          });
        } catch (error) {
          res.status(400).json({ success: false, msg: error.message });
          console.log(error);
        }
      },
      resetpass: async (req, res) => {
        try {
          //console.log(req.route.path);
          const { email, password } = req.body;
          const user = await UserModel.findOne({ email });
          const userotp = await otpModel.findOne({ email });
          if (!userotp) throw new Error("Verification Timed OUT");
          if (!user) throw new Error("No user found!");
    
          if (userotp.verify == true) {
            const result = await bcrypt.compare(password, user.password);
            if (result) throw new Error("Please Change to new Password");
            const passwordHash = await bcrypt.hash(password, 12);
            user.password = passwordHash;
            user.save();
            userotp.verify = false;
            userotp.save();
    
            res.status(200).json({
              success: true,
              msg: "password changed successfully",
            });
          } else
            res
              .status(400)
              .json({ success: false, msg: "OTP verification Incomplete" });
        } catch (error) {
          res.status(400).json({ success: false, msg: error.message });
          console.log(error);
        }
      },




}
const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};
  

module.exports=userCtrl;