const userCtrl = require("../controllers/userCtrl");
const router=require("express").Router();
const auth=require("../middleware/auth");
// const auth = require("../middleware/auth");
const Upload = require('../middleware/upload');

router.post('/register',userCtrl.register);
router.post('/signin',userCtrl.signin);
router.post('/sendotp',userCtrl.sendOTP);
router.post('/verifyOtp',userCtrl.verify);
router.post('/resetPassword',userCtrl.resetpass);
router.get('/gethomecourses',auth,userCtrl.gethomecourses);
router.post('/addcourse',auth,Upload.uploadImg.fields([
    {
        name:"video",
        maxCount: 1
    },
    {
        name:"image",
        maxCount: 1 
    }
]),userCtrl.addcourse);
router.post('/refreshtoken',userCtrl.refreshToken);
router.get('/sendcourse',auth,userCtrl.sendcourse);
router.post('/getcoursedetail',auth,userCtrl.sendcoursedetail);
router.post('/addlesson/:id',auth,Upload.uploadImg.single('video'),userCtrl.addlesson);
router.get('/getvideo/:id',auth,userCtrl.getVideo);
router.post('/addtocart/:id',auth,userCtrl.addtocart);
router.post('/cartcount',auth,userCtrl.sendcartcount);
// router.get('/watchvideos/:id',auth,userCtrl.watchVideo);




module.exports=router;
