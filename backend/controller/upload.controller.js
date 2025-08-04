exports.uploadFile = (req,res)=>{
    if(!req.file){
        return res.status(400).json({message:"No File Uploaded"})

    }
    return res.status(200).json({
        message: "File Uploaded successfully",
        filePath : `/${req.query.folderName}/${req.file.filename}`
    })
}