const sgMail = require('@sendgrid/mail');
const {SENDGRID_API_KEY} = require("../config")

sgMail.setApiKey(SENDGRID_API_KEY);

const sendConfirmationEmail = (email,nickname,userId) =>  {
    const msg = {
        to: email,
        from: 'noreply@nodefaq.com',
        subject: 'Confirm your email on NodeFAQ',
        text: `Hello ${nickname}, welcome on NodeFAQ !`,
        html: `<strong> Hello ${nickname}, welcome on NodeFAQ !</strong><br>
                <p> Please confirm you email by clicking on the following link :</p>
                <a href="http://localhost:3000/faq/emailvalidation/${userId}">http://localhost:3000/faq/emailvalidation/${userId}</a>`,
    }
    sgMail.send(msg);
}

module.exports = {sendConfirmationEmail}