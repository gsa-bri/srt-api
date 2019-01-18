var express = require('express');
const logger = require('../config/winston');
const Agency = require('../models').Agency;

require('../tests/test.lists');

const randomWords = require('random-words');

/**
 * prediction routes
 */
module.exports = {


    predictionFilter: function (req, res) {

        // TODO: Remove this fake random implementation before going to production
        Math.seed = 52;
        Math.random = function(max, min) {
            max = max || 1;
            min = min || 0;

            Math.seed = (Math.seed * 9301 + 49297) % 233280;
            var rnd = Math.seed / 233280;

            return min + rnd * (max - min);
        };

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        }
        function pickOne(a) {
            return a[getRandomInt(0, a.length)]
        }


        let reviewRecArray = ["Compliant", "Non-compliant (Action Required)", "Undetermined"];
        let noticeTypeArray = ["Presolicitation", "Combined Synopsis/Solicitation", "Sources Sought"];
        let actionStatusArray = ["Email Sent to POC", "reviewed solicitation action requested summary", "provided feedback on the solicitation prediction result"];
        let template =

            {
                solNum: "1234",
                title: "sample title",
                url: "http://www.tcg.com/",
                predictions: {
                    value: "GREEN"
                },
                reviewRec: "Compliant", // one of "Compliant", "Non-compliant (Action Required)", or "Undetermined"
                date: "01/01/2019",
                numDocs: 3,
                eitLikelihood: {
                    naics: "naics here",  // initial version uses NAICS code to determine
                    value: "45"
                },
                agency: "National Institutes of Health",
                office: "Office of the Director",

                contactInfo: {
                    contact: "contact str",
                    name: "Joe Smith",
                    position: "Manager",
                    email: "joe@example.com"
                },
                position: "pos string",
                reviewStatus: "on time",
                noticeType: "notice type",
                actionStatus: "ready",
                actionDate: "02/02/2019",
                parseStatus: [{
                    name: "doc 1",
                    status: "parsed"
                }],
                history: [{
                    date: "03/03/2018",
                    action: "sending",
                    user: "crowley",
                    status: "submitted"
                }],
                feedback: [{
                    questionID: "1",
                    question: "Is this a good solicitation?",
                    answer: "Yes",
                }],
                undetermined: true

            };

        let sample_data = new Array();

        for (let i=0; i < 49; i++) {
            let o = Object.assign({}, template);

            o.title = randomWords({ exactly:1, wordsPerString: getRandomInt(2,7) })[0];
            o.reviewRec = pickOne (reviewRecArray);
            o.agency = pickOne( all_fed_agencies_array );
            o.solNum = getRandomInt(999,99999999);
            o.noticeType = pickOne(noticeTypeArray);
            o.actionStatus = pickOne(actionStatusArray);
            o.actionDate = getRandomInt(1,12) + "/" + getRandomInt(1,28) + "/" + getRandomInt(2015,2020);
            o.date = getRandomInt(1,12) + "/" + getRandomInt(1,28) + "/" + getRandomInt(2015,2020);
            o.office = randomWords({ exactly:1, wordsPerString: getRandomInt(2,4) })[0];
            o.predictions.value = pickOne(["RED", "GREEN"]);
            sample_data.push( o );
        }

        res.status(200).send(sample_data);

    // var filterParams = {
    //     "$and": [
    //         {'eitLikelihood.value': 'Yes'},
    //         {'noticeType': {'$ne': 'Presolicitation'}},
    //         {'noticeType': {'$ne': 'Special Notice'}},
    //     ]
    // };
    //
    // var agency = req.body.agency.split(' (')[0];
    // var office = req.body.office;
    // var contactInfo = req.body.contactInfo;
    // var solNum = req.body.solNum;
    // var reviewRec = req.body.reviewRec;
    // var eitLikelihood = req.body.eitLikelihood;
    // var reviewStatus = req.body.reviewStatus;
    // var numDocs = req.body.numDocs;
    // var parseStatus = req.body.parsing_report;
    //
    // if (agency) {
    //     _.merge(filterParams, {agency: agency});
    // }
    // if (contactInfo) {
    //     _.merge(filterParams, {contactInfo: contactInfo});
    // }
    // if (office) {
    //     _.merge(filterParams, {office: office});
    // }
    // if (solNum) {
    //     _.merge(filterParams, {solNum: solNum});
    // }
    // if (reviewRec) {
    //     _.merge(filterParams, {reviewRec: reviewRec});
    // }
    // if (eitLikelihood) {
    //     _.merge(filterParams, {eitLikelihood: eitLikelihood});
    // }
    // if (reviewStatus) {
    //     _.merge(filterParams, {reviewStatus: reviewStatus});
    // }
    // if (numDocs) {
    //     _.merge(filterParams, {numDocs: numDocs});
    // }
    // if (parseStatus) {
    //     _.merge(filterParams, {parseStatus: parseStatus});
    // }
    //
    // Prediction.find(filterParams).then((predictions) => {
    //     res.send(predictions);
    // }, (e) => {
    //     res.status(400).send(e);
    // });
}

//
// /**
//  *
//  */
// app.post('/predictions', (req, res) => {
//     var pred = new Prediction({
//         solNum: req.body.solNum,
//         title: req.body.title,
//         url: req.body.url,
//         predictions: req.body.predictions,
//         reviewRec: req.body.reviewRec,
//         date: req.body.date,
//         numDocs: req.body.numDocs,
//         eitLikelihood: req.body.eitLikelihood,
//         agency: req.body.agency,
//         office: req.body.office,
//         contactInfo: req.body.contactInfo,
//         position: req.body.position,
//         reviewStatus: "Incomplete",
//         noticeType: req.body.noticeType,
//         actionStatus: req.body.actionStatus,
//         parseStatus: req.body.parsing_report,
//         history: req.body.history,
//         feedback: req.body.feedback,
//         undetermined: req.body.undetermined
//     });
//
//     pred.save().then((doc) => {
//         res.send(doc);
//     }, (e) => {
//         res.status(400).send(e);
//     });
// });
//
// /**
//  * Insert history predictions to database
//  */
// app.put('/predictionshistory', (req, res) => {
//     PredictionHistory.findOne({solNum:req.body.solnum}, function(err, solicitation){
//         if(err){
//             res.send(err);
//         }
//         if(solicitation) {
//
//             PredictionHistory.findOne({solNum: req.body.solnum}, function(err, result) {
//                 if(err){
//                     res.send(err)
//                 }
//                 result.predictionHistory = req.body.predhistory
//                 result.save(function(err){
//                     if(err)
//                         res.send(err);
//
//                     res.json({message: 'history updated!'})
//                 })
//             })
//
//         }
//         else{
//
//             var predhistory = new PredictionHistory({
//                 solNum: req.body.solnum,
//                 title: req.body.title,
//                 noticeType: req.body.noticeType,
//                 predictionHistory:req.body.predhistory,
//                 eitLikelihood: req.body.eitLikelihood
//             });
//             predhistory.save().then((doc) => {
//                 res.send(doc);
//             }, (e) => {
//                 res.status(400).send(e);
//             });
//
//         }
//     })
// })
//
//
//
// /**
//  * Get the certain prediction history and feedback
//  */
// app.post('/predictionshistory', (req, res) => {
//     Prediction.findOne({_id : req.body.solicitationID}).then((result) => {
//         if(result){
//             PredictionHistory.findOne({solNum : result.solNum}).then((history) => {
//                 if(history != null){
//                     res.send(history);
//                 }else {
//                     res.json({message: "no result"})
//                 }
//
//             }, (e) => {
//                 res.status(400).send(e);
//             });
//         }
//     })
//
//
// });
//
//
// /**
//  * Get the feed prediction history and feedback
//  */
// app.post('/predictionfeedback', (req, res) => {
//     Prediction.findOne({_id : req.body.solicitationID}).then((result) => {
//             if(result){
//                 if(result.feedback.length != 0) {
//                     res.json({hasFeedback : true, solicitationNum: result.solNum});
//                 }
//                 else{
//                     res.json({message: "no feedback"})
//                 }
//             }else{
//                 res.json({message: "no solicitation in database"})
//             }
//
//         }, (e) => {
//             res.status(400).send(e);
//         }
//     )
// });
//
//
// /**
//  * Insert new predictions to database
//  */
// app.put('/predictions', (req, res) => {
//
//     var now = new Date().toLocaleDateString();
//
//     Prediction.findOne({solNum:req.body.solNum}, function (err, solicitation) {
//
//         if (err)
//         {
//             res.send(err);
//         }
//
//
//         if (solicitation)
//         {
//             // Update the solicitation fields with new FBO data
//             var r = solicitation.history.push({'date': req.body.date, 'action': 'Solicitation Updated on FBO.gov', 'user': '', 'status' : 'Solicitation Updated on FBO.gov'});
//             req.body.history = solicitation.history;
//             req.body.actionStatus = 'Solicitation Updated on FBO.gov';
//             req.body.actionDate = req.body.date
//             Prediction.update({solNum: req.body.solNum}, req.body).then((doc) => {
//                 res.send(doc);
//             }, (e) => {
//                 res.status(400).send(e);
//             })
//         }
//         else
//         {
//
//             var history= [];
//             var r = history.push({'date': req.body.date, 'action': 'Pending Section 508 Coordinator review', 'user': '', 'status' : 'Pending Section 508 Coordinator Review'});
//
//             var history= [];
//             var r = history.push({'date': req.body.date, 'action': 'Pending Section 508 Coordinator review', 'user': '', 'status' : 'Pending Section 508 Coordinator Review'});
//
//             var pred = new Prediction({
//                 solNum: req.body.solNum,
//                 title: req.body.title,
//                 url: req.body.url,
//                 predictions: req.body.predictions,
//                 reviewRec: req.body.reviewRec,
//                 date: req.body.date,
//                 numDocs: req.body.numDocs,
//                 eitLikelihood: req.body.eitLikelihood,
//                 agency: req.body.agency,
//                 office: req.body.office,
//                 contactInfo: req.body.contactInfo,
//                 position: req.body.position,
//                 reviewStatus: "Incomplete",
//                 noticeType: req.body.noticeType,
//                 actionStatus: req.body.actionStatus,
//                 parseStatus: req.body.parseStatus,
//                 history: history,
//                 feedback: req.body.feedback,
//                 undetermined: req.body.undetermined
//             });
//             pred.save().then((doc) => {
//                 res.send(doc);
//             }, (e) => {
//                 res.status(400).send(e);
//             });
//         }
//     })
// });


}