const UserModel=require("../models/userModel");
const otpModel = require("../models/otpModel");
const vidModel=require("../models/videoModel");
const bcrypt=require("bcrypt");
const mongoose = require("mongoose");
const jwt=require("jsonwebtoken");
const courseModel=require("../models/courseModel");
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

                // res.cookie("refreshtoken", refreshtoken, {
                // httpOnly: true,
                // path: "/user/refresh_token",
                // maxAge: 7 * 24 * 60 * 60 * 1000, //7d
                // });

                // res.cookie("accesstoken",accesstoken,{
                //   httpOnly: true,
                //   path: "/user/access_token",
                //   maxAge: 1* 24 * 60 * 60 * 1000, //1d
                // })

                res.status(200).json({
                success: true,
                msg: "Signup successful !",
                refreshtoken,
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
          if (!result) throw new Error("Wrong Password!");
    
          const accesstoken = createAccessToken({ id: user._id });
          const refreshtoken = createRefreshToken({ id: user._id });

          // res.cookie("refreshtoken", refreshtoken, {
          //   httpOnly: true,
          //   path: "/user/refresh_token",
          //   maxAge: 7 * 24 * 60 * 60 * 1000, //7d
          // });

          // res.cookie("accesstoken",accesstoken,{
          //   httpOnly: true,
          //   path: "/user/access_token",
          //   maxAge: 1* 24 * 60 * 60 * 1000, //1d
          // })
          res.status(200).json({
            success: true,
            msg: "Login successful",
            refreshtoken,
            accesstoken
          });
        } catch (error) {
          res.status(400).json({ success: false, msg: error.message });
          console.log(error);
        }
      },
      refreshToken: async(req, res) => {
      try {
        
        let token = req.body.refreshtoken;
       
        console.log(token);
        
       

      

          if (!token)
            return res.status(401).json({ msg: "Please Login or Register" });

          jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(401).json({ msg: "Please Login or Register" });

            console.log('access token expired !');
            const accesstoken = createAccessToken({ id: user.id });

            res.json({ accesstoken });
          });
        } catch (err) {
          return res.status(400).json({ msg: err.message });
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
      sendOTP: async (req, res) => {
        try {
          // console.log(req.route.path);
          const { email } = req.body;
    
          const user = await UserModel.findOne({ email });
          if (!user) throw new Error("No user found!");
          const userotp = await otpModel.findOne({ email });
          if (!userotp) {
            const userotp = otpModel({
              createdAt: new Date(),
              email,
              otp: null,
            });
            await userotp.save();
            userotp.otp = otpGenerator.generate(4, {
              upperCaseAlphabets: false,
              specialChars: false,
              lowerCaseAlphabets: false,
            });
            await userotp.save();
          }
          
          if(userotp){
            userotp.otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
          });
          await userotp.save();
    
          const mailoptions = {
            from: "skilledgetechnology@gmail.com",
            to: email,
            subject: "Skilledge Verification OTP",
            html: `
            <div
              class="container"
              style="max-width: 90%; margin: auto; padding-top: 20px"
            >
              <h2>Skilledge OTP verification</h2>
              <h4>You are about change your account password.</h4>
              <p style="margin-bottom: 30px;">Please enter this OTP to change password.</p>
              <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${userotp.otp}</h1>
         </div>
          `,
          };
          transporter.sendMail(mailoptions, (err, info) => {
            if (err) {
              console.log(err);
              throw new Error("Mail not sent");
            } else {
              console.log("mail sent");
            }
          });
        }
          res.status(200).json({
            success: true,
            msg: "mail sent",
          });
        } catch (error) {
          res.status(400).json({ success: false, msg: error.message });
          console.log(error);
        }
      },
      sendcourse:async(req,res)=>{
         
        let token=req.header['accesstoken'] || req.headers['authorization'];
        token=token.replace(/^Bearer\s+/,"");
        const decode=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const _id=decode.id;
        const id=mongoose.Types.ObjectId(_id);

        const userdetails=await UserModel.findById(_id).populate('myCourses');
        
        const {myCourses}=userdetails;
        res.status(200).json({
          success: true,
          msg: "my course sent !",
          myCourses
        })
        
      },
      verify: async (req, res) => {
        try {
          // console.log(req.route.path);
          const { email, otp } = req.body;
          const user = await UserModel.findOne({email});
          const userotp = await otpModel.findOne({ email });
          // console.log(user);
          // console.log(userotp);
          if (!userotp) throw new Error("OTP timed out.");
          if (!user) throw new Error("No user found!");
          if (userotp.otp == otp) {
            res.status(200).json({
              success: true,
              msg: "user verified",
              id:user._id,
            });
          } else res.status(400).json({ success: false, msg: "OTP incorrect" });
        } catch (error) {
          res.status(400).json({ success: false, msg: error.message });
          console.log(error);
        }
      },
      addcourse:async(req,res)=>{
        try{
          let{topic,description,detailed_description,categories,price,lesson}=req.body;
          
          let token=req.header['accesstoken'] || req.headers['authorization'];
          token=token.replace(/^Bearer\s+/,"");
          const decode=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
          const _id=decode.id;
          const id=mongoose.Types.ObjectId(_id);
          let imgpath=null;
          let vidpath=null
          // console.log(req.files.video[0].filename);
          // console.log(req.files.image[0].filename);
          if(req.files.video!=undefined){
            vidpath = 'uploads/Video/' + req.files.video[0].filename;
          }
          if(req.files.image!=undefined){
            imgpath = 'uploads/Thumbnail/' + req.files.image[0].filename;
          }

          if(!id)throw new Error("login or register !");
          const user=await UserModel.findById(id);
          if(!user){
            throw new Error("no such user found !");
          }

          const course=await courseModel.create({
            educatorid:id,
            imgpath,
            topic,
            description,
            detailed_description,
            categories,
            price
            // lesson,
            // vidpath
          })

          const Lesson=await vidModel.create({
            lesson,
            vidpath
          })

          await UserModel.findByIdAndUpdate(id,{
            $addToSet:{myCourses:course._id}
           });
           
           await courseModel.findByIdAndUpdate(course._id,{
            $addToSet:{lessons:Lesson._id}
           })

           res.status(200).json({
            success:true,
            msg:"Course added successfully !",
            });


        }
        catch(err){
          res.status(400).json({success:false,msg:err.message});
          console.log(err);
        }

        
      },
      addlesson:async(req,res)=>{
        // const userdetails=await UserModel.findById(_id).populate('myCourses');

        try{
            let {id,lesson}=req.body;
            let vidpath=null
            console.log(req.file);
              // console.log(req.files.video[0].filename);
              // console.log(req.files.image[0].filename);
            if(req.file!=undefined){
                vidpath = 'uploads/Video/' + req.file.filename;
            }

            let _id=mongoose.Types.ObjectId(id)

            
            const Lesson=await vidModel.create({
              _id,
              lesson,
              vidpath
            })

            await courseModel.findByIdAndUpdate(id,{
              $addToSet:{lessons:Lesson._id}
            })

            Lesson.save();

            res.status(200).json({
              success:true,
              msg:"lesson added successfully !"
            })
          }
          catch(err){
            res.status(400).json({
              success:false,
              msg:err.message
            })
          }
      },
      getVideo:async(req,res)=>{
        try{
          const id=req.params.id;
          const _id=mongoose.Types.ObjectId(id);
          const videoDetails=await vidModel.findById({_id});
          if(!id){
            throw new Error("No video lesson found !");
          }
          res.status(200).json({
            success:true,
            videoDetails
          })


        }
        catch(err){
          res.status(400).json({
            success:false,
            msg:err.message
          })
        }

      },
      getcourse:async(req,res)=>{
        try{
          console.log("hello");


          res.status(200).json({
            success:true,
            msg:"courses sent!"
          });

        }
        catch(error){
          res.status(400).json({success:false,msg:error.message});
          console.log(error);
        }
      
      },
      resetpass: async (req, res) => {
        try {
          // console.log(req.route.path);
          const { email, password } = req.body;
          const user = await UserModel.findOne({ email });
          // const userotp = await otpModel.findOne({ email });
          // if (!userotp) throw new Error("Verification Timed OUT");
          if (!user) throw new Error("No user found!");
    
          // if (userotp.verify == true) {
            const result = await bcrypt.compare(password, user.password);
            if (result) throw new Error("Please Change to new Password");
            const passwordHash = await bcrypt.hash(password, 12);
            user.password = passwordHash;
            user.save();
            // userotp.verify = false;
            // userotp.save();
    
            res.status(200).json({
              success: true,
              msg: "password changed successfully",
            });
          // } else
          //   res
          //     .status(400)
          //     .json({ success: false, msg: "OTP verification Incomplete" });
        } catch (error) {
          res.status(400).json({ success: false, msg: error.message });
          console.log(error);
        }
      
      },
      sendcoursedetail:async(req,res)=>{
        try{
          const {id}=req.body;
          
          let _id=mongoose.Types.ObjectId(id);
    
          
          const coursedetail=await courseModel.findById({_id});
          const educatorid=coursedetail.educatorid;
          _id=educatorid
          
          const educatordetail=await UserModel.findById({_id});

          const username=educatordetail.username;
          
          if(!coursedetail)throw new Error("No course found !");
          res.status(200).json({
            success: true,
            username,
            coursedetail,
            msg: "Course details sent successfully !",
          });


        }
        catch(error){
          res.status(400).json({success:false,msg:error.message});
          console.log(error);
        }
      }




}
const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};
  

module.exports=userCtrl;