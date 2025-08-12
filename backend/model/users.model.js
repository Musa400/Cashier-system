const mongo = require("mongoose");
const bcrypt = require("bcryptjs");

const {Schema} = mongo;

const usersSchema = new Schema({
    fullname:String,
    mobile :{
        type:Number,
    
    },
    email :{
        type:String,
        unique:true
    },

    password : String,
    profile : String,
    key : String,
    address : String,
    branch : String,
    userType : String,
    isActive : {
        type : Boolean,
        default : false
    }
},{timestamps:true});

usersSchema.pre("save",async function(next){
    const user = this;
    if(!user.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);
    next();
})

module.exports = mongo.model("user",usersSchema);