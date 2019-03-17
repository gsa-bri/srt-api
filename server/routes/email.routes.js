/** @module EmailRoutes */
const express = require('express');

const nodemailer = require((process.env.MAIL_ENGINE) ? process.env.MAIL_ENGINE : 'nodemailer');
const jwt = require('jsonwebtoken');
const logger = require('../config/winston');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

/**
 * Email message format
 * @typedef {Object} Message
 * @property {string} text email body text
 * @property {string} html email body text in HTML format. Will override text if present.
 * @property {string} to To email address
 * @property {string} cc CC email addresses
 * @property {string} from From email address
 * @property {string} subject Email subject
 */

/**
 * Send email message function. Promise will provide some error info if it is rejected
 *
 * @param {Message} message (see type def)
 * @return {Promise}
 */

function sendMessage(message) {
    if ( (message.text == undefined && message.html == undefined  )||
        message.to == undefined ||
        message.subject == undefined ) {
        return new Promise ( (resolve, reject) => {
            reject({success: false, params_correct: false, message: "E-mail text, to, and subject are all required."})
        });
    }

    if (message.text != undefined && message.html == undefined) {
        message.html = message.text;
        delete message.text;
    }

    if (process.env.SENDGRID_API_KEY) {
        config.emailServer.auth.pass = process.env.SENDGRID_API_KEY;
    }

    let transporter = nodemailer.createTransport(config.emailServer);
    logger.log("info", "Sending email to " + message.to + " with subject " + message.subject, {tag:"email"});

    if (config.emailLogOnly) {
        logger.log("debug", message, {tag : "email log"});
        return new Promise ( (resolve, reject) => {
            resolve({success: true, params_correct: true, message: "Email has been sent"})
        });
    } else {

        return transporter.sendMail(message)
            .then( info => {

                logger.log ("info", info)
                if (info.response.toLowerCase().indexOf('ok') == -1 && info.response.toLowerCase().indexOf('success') == -1) {
                    throw info.response;
                }

                return new Promise ( (resolve, reject) => {
                    resolve({success: true, params_correct: true, message: "Email has been sent"})
                });
            })
            .catch( err => {
                logger.log("error", err, {tag: "sendMessage"});
                return new Promise ( (resolve, reject) => {
                    reject({success: false, params_correct: true, message: err})
                });
            })

    }

}


module.exports = {

    sendMessage : sendMessage,

    /**
     * Will attempt to send an email message when called.
     * The from address will be taken from the configuration file
     *
     * @param {Object} req
     * @param {Object} req.body
     * @param {string} req.body.text Message text
     * @param {string} req.body.emailTo To address
     * @param {string} req.body.emailCC CC addresses
     * @param {string} req.body.subject Email subject
     * @param {Response} res
     * @return {Promise}
     */
    email : async function (req, res) {
        let mailOptions = {
            text: req.body.text,
            from: config.emailFrom,
            to: req.body.emailTo,//req.body.email,
            cc: req.body.emailCC,
            subject: req.body.subject
        };

        return sendMessage(mailOptions, res)
            .then ( (status) => {
                return res.status(200).send({message:"Email has been sent."});
            })
            .catch ( (status) => {
                logger.log ("info", status, {tag: "email - catch"});
                if ( ! status.params_correct) {
                    // params were not correct....so this is client error
                    logger.log("info", mailOptions, {tag: "sendMessage - missing some params"});
                    //return res.status(400).send("Subject, to, and from are all required fields.");
                    return res.status(400).send( {message: 'Email has sent'} );
                } else {
                    // client sent good data, we messed up somewhere
                    logger.log("info", mailOptions, {tag: "sendMessage - missing some params"});
                    return res.status(500).send("Error sending email.");
                }
            })
    },

    /**
     * This method will send an email to the user informing them of a password change request.
     * User info is obtained by decoding the JWT attached to the request.
     *
     * @param {Object} req
     * @param res
     * @return {Promise}
     */
    updatePassword : async (req, res) => {
        var token = req.headers['authorization'].split(' ')[1];
        if (token != 'null') {

            var user = jwt.decode(token).user;

            var bodytext = "You have requested to change your password! If you did not take this action please contact " + config.emailFrom
            var message = {
                text: bodytext,
                from: config.emailFrom,
                to: user.email,//req.body.email,
                cc: '',
                subject: "Change password"
            };

            return sendMessage(message, res)
                .then( (status) => {
                    return res.status(200).send("dEmail has been sent.");
                })
                .catch( (status) => {
                    if ( ! status.params_correct) {
                        // params were not correct....so this is client error
                        return res.status(400).send("Subject, to, and from are all required fields.");
                    } else {
                        // client sent good data, we messed up somewhere
                        return res.status(500).send("Error sending email.");
                    }
                });

        }
    }



}
