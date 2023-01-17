import multer from 'multer'

export const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "uploads")
        },
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "-" +Date.now() + ".jpg")
        }
    })
}).single('files')
