// load all the  pre-set properties
import config from './config.js';

// express is a wrserverer around http / https
// const express = require('express');
import express from 'express';  //1
import cors from 'cors';
const server = express();   //2

// this will enable cross platefrom submisison
server.use(cors());

import fileupload from 'express-fileupload';
server.use(fileupload());

import bodyParser from 'body-parser';
server.use(bodyParser.json());       // to support JSON-encoded bodies --> POST: {"name":"foo","color":"red"} 

import fs from 'fs';


//import dataSource from './uploads/readFileDb.js';    // if you do not have oracle connection available to you use json file
import dataSource from './uploads/readFromOracle.js';


// Server 
server.listen(config.port, config.host, () => {
    console.info('Express listening on port', config.port);
});

server.get('/api/Staff', (req, res) => {
    dataSource.getStaffList()   // will send a promise
        .then(result => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');
            res.send(result);
        })
        .catch(err => console.error(err));
});

server.get('/api/Staff/:id', (req, res) => {
    const sID = req.params.id;
    dataSource.getStaffDetail(sID).then(result => {
        res.send(result);
    }).catch(err => console.error(err));
});

server.get('/api/DESIGNATION', (req, res) => {
    dataSource.getDesignationList()   // will send a promise
        .then(result => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');
            res.send(result);
        }).catch(err => console.error(err));
});

server.post('/api/Staff/Update', async (req, res) => {
    try {

        if (!req.files) {
            console.log("No File Recieved");
        }
        else {
            //Use the name of the input field (i.e. "document") to retrieve the uploaded file
            let document = req.files.file; //req.files.document;

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            document.mv('./uploads/' + document.name);
        }

        var StaffID = req.body.StaffID;
        if (typeof (StaffID) === "undefined") {

            // get maximum staff Id
            dataSource.getMaxStaffID()
                .then(ret => {

                    let item = {
                        "StaffId": ret,
                        "FirstName": req.body.FirstName,
                        "LastName": req.body.LastName,
                        "DesignationId": req.body.Designation,
                        "EmiratesId": req.body.EmiratesID,
                        "EIDExpiry": formatDate(req.body.EIDExpiry),
                        "FileName": req.body.FileName
                    };

                    dataSource.addNewStaff(item).then(obj => {
                        res.send({
                            status: true,
                            message: 'Completed',
                            data: { 'Rows Affected': obj }
                        });
                    }).catch(err => { res.status(500).send(err); });

                })
                .catch(err => { res.status(500).send(err); });

        }
        else {
            let item = {
                "StaffId": StaffID,
                "FirstName": req.body.FirstName,
                "LastName": req.body.LastName,
                "DesignationId": req.body.Designation,
                "EmiratesId": req.body.EmiratesID,
                "EIDExpiry": formatDate(req.body.EIDExpiry),
                "FileName": req.body.FileName
            };
            dataSource.updateStaff(item).then(obj => {
                res.send({
                    status: true,
                    message: 'Completed',
                    data: { 'Rows Affected': obj }
                });
            }).catch(err => { res.status(500).send(err); });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

server.get('/api/file/download/:name', function (req, res) {
    const _fileName = req.params.name;
    let __dirname = fs.realpathSync('.');
    let file = `${__dirname}\\uploads\\${_fileName}`;
    res.download(file);
});

// create a GET route
server.get('/backend_test', (req, res) => {
    try {
        // storeJsonToFile();
        // readJsonFromFile()
        /*let item = {
           "STAFF_ID":0,
           "FIRST_NAME":"XXX",
           "LAST_NAME":"YYYY",
           "DESIG_ID":321,
           "DESIGNATION":"Supervisor - Performing Authority",
           "EMIRATES_ID":"4201-683-1",
           "EID_EXPIRY":"07-Mar-2023",
           "FILE_NAME":"predator.jpg",
           "CREATED_BY":"New",
           "CREATION_DATE":"28-Mar-2022"
        };        
        console.log(tools.setStaffDetailByIDToFile(item));*/

        //dataSource.getDesignationList().then(obj => {
            //console.log(obj);
        //});
        console.log('Start!');
    } catch (err) {
        console.error('Whoops!');
        console.error(err);
    }
    res.send({ express: 'Server is running' });
}); 


function formatDate(date) {
    var mn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var d = new Date(date),
        month = '' + mn[(d.getMonth())],
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('-');
}
