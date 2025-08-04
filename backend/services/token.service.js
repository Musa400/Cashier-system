// 



require("dotenv").config();

const jwt = require("jsonwebtoken");

const verifyToken = async (req) => {
    try {
        // Check if authorization header exists
        if (!req.headers.authorization) {
            return {
                message: "No authorization header provided",
                isVerified: false
            };
        }

        // Split the token from 'Bearer <token>'
        const token = req.headers.authorization.split(" ")[1];
        
        if (!token) {
            return {
                message: "No token provided",
                isVerified: false
            };
        }

        // Verify the token
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        
        return {
            message: "Token verified successfully",
            isVerified: true,
            data: decoded
        };
    } catch (err) {
        // Handle different types of JWT errors
        let errorMessage = "Invalid token";
        
        if (err.name === 'TokenExpiredError') {
            errorMessage = "Token has expired";
        } else if (err.name === 'JsonWebTokenError') {
            errorMessage = "Invalid token format";
        }

        return {
            message: errorMessage,
            isVerified: false,
            error: err.name
        };
    }
};

module.exports = { verifyToken };