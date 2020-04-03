const fs = require('fs');

let rawdata = fs.readFileSync('./config/sendgridkey.json');
const SENDGRID_API_KEY = JSON.parse(rawdata).SENDGRID_API_KEY;

module.exports = {SENDGRID_API_KEY}