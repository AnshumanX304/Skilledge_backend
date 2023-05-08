const multer=require('multer');
const storage=multer.diskStorage({
        destination:(req,file,cb)=>{
                if(file.fieldname==="image")
                    cb(null,'./uploads/Thumbnail');

                if(file.fieldname==="video")
                    cb(null,'./uploads/Video');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + file.originalname);
          }
})
const fileFilter = (req,file,cb) => {

    if(file.fieldname==='image'){
        if(file.mimetype === 'image/jpeg'||
        file.mimetype === 'image/jpg'||
        file.mimetype === 'image/png'
        )
            cb(null,true);
        else
            cb(null,false);
    }
    
    if(file.fieldname==='video'){
        if(file.mimetype === 'video/mp4')
            cb(null,true);
        else
            cb(null,false);

    }
}

const uploadImg = multer({
    storage,
    limits:{
        fileSize: '10mb'
    },
    fileFilter
});

module.exports = {
    uploadImg
}