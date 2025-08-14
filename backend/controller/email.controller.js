require("dotenv").config();
const nodemailer = require("nodemailer");

const sendEmail = (req, res) => {
    const { email, password } = req.body;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.ADMIN_EMAIL_PASSWORD
        }
    });

    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Account Details</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        
        <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="height: 100vh; width: 100%; text-align: center; vertical-align: middle;">
        <tr>
            <td align="center" valign="middle">
            
            <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); font-family: Arial, sans-serif; margin: auto;">
                
                <tr>
                <td align="center" style="padding: 20px 0;">
                    <img src="https://www.justforcode.in/images/logo.jpg" alt="Company Logo" width="120" style="display: block;">
                </td>
                </tr>
                
                <tr>
                <td align="center" style="padding: 10px 0; background-color: #007BFF; color: #ffffff; font-size: 22px; font-weight: bold;">
                    JFC Corporative Bank
                </td>
                </tr>
                
                <tr>
                <td style="padding: 20px;">
                    <h2 style="font-size: 20px; margin-bottom: 15px; color: #333;">Welcome to Our Platform!</h2>
                    <p style="font-size: 16px; color: #555;">
                    Here are your login credentials:
                    </p>
                    <table cellpadding="10" cellspacing="0" width="100%" style="margin-top: 10px; border: 1px solid #ddd;">
                    <tr style="background-color: #f9f9f9;">
                        <td style="font-weight: bold; width: 30%;">Username:</td>
                        <td>${email}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="font-weight: bold;">Password:</td>
                        <td>${password}</td>
                    </tr>
                    </table>
                    <p style="margin-top: 20px; font-size: 14px; color: #888;">
                    Please keep this information secure and do not share it with anyone.
                    </p>
                    <p style="margin-top: 30px; font-size: 16px;">
                    Best regards,<br><br>
                    <strong>Just For Code</strong>
                    </p>
                </td>
                </tr>
                
                <tr>
                <td align="center" style="padding: 15px; background-color: #f1f1f1; font-size: 12px; color: #666;">
                    &copy; 2025 JFC Corporative Bank . All rights reserved.
                </td>
                </tr>
            </table>
            </td>
        </tr>
        </table>
    </body>
    </html>
        `;

    const mailOption = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'PMS Authentication',
        html: emailTemplate
    }

    transporter.sendMail(mailOption, (err, info) => {
        if (err) {
            return res.status(500).json({
                message: "Sending failed!",
                email: false
            })
        }
        res.status(200).json({
            message: "Sending success!",
            email: true
        })
    });
}

const sendExchangeConfirmationEmail = (req, res) => {
    const { toEmail, exchangeData } = req.body;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.ADMIN_EMAIL_PASSWORD
        }
    });

    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Exchange Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="height: 100vh; width: 100%; text-align: center; vertical-align: middle;">
            <tr>
                <td align="center" valign="middle">
                    <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); font-family: Arial, sans-serif; margin: auto;">
                        <tr>
                            <td align="center" style="padding: 20px 0; background-color: #007BFF; color: #ffffff; font-size: 22px; font-weight: bold;">
                                Exchange Confirmation
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px;">
                                <h2>Hello ${exchangeData.customerName},</h2>
                                <p>Your currency exchange has been processed successfully.</p>
                                
                                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>Account Number:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${exchangeData.accountNo || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>Date & Time:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${new Date(exchangeData.date).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>From:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${exchangeData.amount} ${exchangeData.fromCurrency}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>To:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${exchangeData.convertedAmount} ${exchangeData.toCurrency}</td>
                                    </tr>
                                   <tr>
    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>Exchange Rate:</strong></td>
    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
        // 1 ${exchangeData.fromCurrency} = ${parseFloat(exchangeData.rate).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${exchangeData.toCurrency}
        <br/>
        1 ${exchangeData.toCurrency} = ${(1 / parseFloat(exchangeData.rate)).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${exchangeData.fromCurrency}
    </td>
</tr>

                                </table>
                                
                                <p>Thank you for using our service!</p>
                                <p>Best regards,<br>Your Bank</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 15px; background-color: #f1f1f1; font-size: 12px; color: #666;">
                                &copy; ${new Date().getFullYear()} Your Bank. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const mailOption = {
        from: process.env.ADMIN_EMAIL,
        to: toEmail,
        subject: 'Exchange Transaction Confirmation',
        html: emailTemplate
    }

    transporter.sendMail(mailOption, (err, info) => {
        if (err) {
            return res.status(500).json({
                message: "Sending failed!",
                email: false
            })
        }
        res.status(200).json({
            message: "Sending success!",
            email: true
        })
    });
}

const sendTransactionConfirmationEmail = (req, res) => {
    const { toEmail, transactionData } = req.body;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.ADMIN_EMAIL_PASSWORD
        }
    });

    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Transaction Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="height: 100vh; width: 100%; text-align: center; vertical-align: middle;">
            <tr>
                <td align="center" valign="middle">
                    <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); font-family: Arial, sans-serif; margin: auto;">
                        <tr>
                            <td align="center" style="padding: 20px 0; background-color: #007BFF; color: #ffffff; font-size: 22px; font-weight: bold;">
                                Transaction Confirmation
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px;">
                                <h2>Hello ${transactionData.customerName || 'Valued Customer'},</h2>
                                <p>Your transaction has been processed successfully.</p>
                                
                                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>Account Number:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${transactionData.accountNo || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>Transaction Type:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; text-transform: capitalize;">${transactionData.transactionType || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>Amount:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${transactionData.transactionAmount || '0.00'} ${transactionData.currency || ''}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>Reference:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${transactionData.refrence || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>New Balance:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${transactionData.currentBalance || '0.00'} ${transactionData.currency || ''}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;"><strong>Date & Time:</strong></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${new Date(transactionData.createdAt).toLocaleString() || new Date().toLocaleString()}</td>
                                    </tr>
                                </table>
                                
                                <p>Thank you for using our services!</p>
                                <p>Best regards,<br>Your Bank</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 15px; background-color: #f1f1f1; font-size: 12px; color: #666;">
                                &copy; ${new Date().getFullYear()} Your Bank. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const mailOption = {
        from: process.env.ADMIN_EMAIL,
        to: toEmail,
        subject: 'Transaction Confirmation',
        html: emailTemplate
    };

    transporter.sendMail(mailOption, (err, info) => {
        if (err) {
            console.error('Error sending transaction confirmation email:', err);
            return res ? res.status(500).json({
                message: "Failed to send transaction confirmation email",
                email: false
            }) : false;
        }
        console.log('Transaction confirmation email sent:', info.response);
        return res ? res.status(200).json({
            message: "Transaction confirmation email sent successfully",
            email: true
        }) : true;
    });
};

module.exports = { 
    sendEmail,
    sendExchangeConfirmationEmail,
    sendTransactionConfirmationEmail 
};