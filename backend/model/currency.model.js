const mongo = require("mongoose");


const {Schema} = mongo;

const currencySechmea = new Schema({
    currencyName:{
        type : String,
        unique : true
    },
   
    key : String,
    currencyDesc : String,
   
},{timestamps:true});


module.exports = mongo.model("currency",currencySechmea);