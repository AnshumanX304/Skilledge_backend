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
router.get('/getcourses',auth,userCtrl.getcourse);
router.post('/addcourse',Upload.uploadImg.single('images'),userCtrl.addcourse);


module.exports=router;
