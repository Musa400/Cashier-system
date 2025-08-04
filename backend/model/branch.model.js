const mongo = require("mongoose");


const {Schema} = mongo;

const branchSechmea = new Schema({
    branchName:{
        type : String,
        unique : true
    },
   
    key : String,
    branchAddress : String,
   
},{timestamps:true});


module.exports = mongo.model("branch",branchSechmea);