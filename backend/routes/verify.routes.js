const express = require('express');
const router = express.Router();
const tokenService = require("../services/token.service")



router.get('/', async (req, res) => {
    try {
        const verified = await tokenService.verifyToken(req);
        
        if (verified.isVerified) {
            return res.status(200).json({
                success: true,
                message: verified.message,
                data: verified.data,
                isVerified: true
            });
        } else {
            return res.status(401).json({
                success: false,
                message: verified.message || 'Unauthorized access',
                error: verified.error || 'Invalid token',
                isVerified: false
            });
        }
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during token verification',
            error: error.message,
            isVerified: false
        });
    }
})


module.exports = router;