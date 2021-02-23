const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    originalFileName:{type:String},
    serverFileName:{type:String},
    size:{type:Number},
    uploadedBy:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
    postId:{type:mongoose.Schema.Types.ObjectId, ref:'post'},
    isDeleted:{type:Boolean, default:false},
});

var File = mongoose.model('file', fileSchema);

File.createNewInstance = async (file, uploadedBy, postId) =>{
    return await File.create({
        originalFileName:file.originalFileName,
        serverFileName:file.filename,
        size:file.size,
        uploadedBy:uploadedBy,
        postId:postId,
    });
};

module.exports = File;