const dbService = require("../services/db.service");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt  = require("jsonwebtoken");
const Customers = require("../model/customer.model")
const loginFunc = async (req,res,schema)=>{
    try {
        const {email,password} = req.body;
        const query = {
            email
        }
        const dbRes = await dbService.findOneRecord(query,schema);
        if(dbRes){
            const isMatch = await bcrypt.compare(password,dbRes.password);
            if(isMatch){
                if(dbRes.isActive){
                    delete dbRes._doc.password;
                    const db = await Customers.findOne(
                        {email},
                        { _id: 0, accountNo: 1}
                    );
                    let payload = null ;
                    db ? payload = {
                        ...dbRes._doc,
                        _id: dbRes._id.toString(),
                        accountNo : db.accountNo

                    }
                    :
                     payload = {
                        ...dbRes._doc,
                        _id: dbRes._id.toString()

                    }
                    const token = await jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"3h"})
                    return res.status(200).json({message:"The Login Is Successfully",isLoged:true,token,userType: dbRes._doc.userType})
                } else{
                     return res.status(401).json({message:"Your are not active member !",isLoged:false})

                }

                
            }else{
                 return res.status(401).json({message:"Invalid Credencials !",isLoged:false})
            }
            
        }else{
            return res.status(401).json({message:"Invalid Credencials !",isLoged:false})
        }
        

        
    } catch (err) {
        return res.status(500).json({message:"Internal Server Error",isLoged:false, err})
        
    }

}

module.exports = {
    loginFunc
}