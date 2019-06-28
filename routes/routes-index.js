var express = require('express');
var router = express.Router();
var logger = require('../Controller/LogController');
var configService = require('../Service/ConfigService');
var driverLocationControler = require('../Controller/DriverLocationController');
router.get('/', function (req, res) {
    try {
        let serverStatics = {
            state: "Active",
            up_time: Math.floor(process.uptime())
        };
        res.status(200).send(serverStatics)
    } catch (err) {
        res.status(500).send("Error:- " + err);
    }
});

router.post('/driver/location', function (req, res) {
    configService.getHostDetails().then(hostInfo => {
        logger.generateLog().then(log => {
            let logger = log.getLogger('locationService');
            var serverDetailsJSON = JSON.parse(hostInfo);
            if (serverDetailsJSON.server_details['log_enable'] == true) {
                logger.info(`routes POST: /driver/location`);
            }

            let driverLocationDetails = JSON.parse(JSON.stringify(req.body));
            driverLocationControler.storeLocationDetails_firebase(driverLocationDetails).then(data => {
                res.status(200).send({ message: "stored driver location" });
            }).catch(error => {
                logger.info(error);
                res.status(500).send({ message: "Error:- " + error });
            })




        })
    })
})

router.get('/driver/location', function (req, res) {
    configService.getHostDetails().then(hostInfo => {
        logger.generateLog().then(log => {
            let logger = log.getLogger('locationService');
            var serverDetailsJSON = JSON.parse(hostInfo);
            let radious = serverDetailsJSON.location_details['radious'];
            let field = serverDetailsJSON.location_details['field'];
            let locationDetails = JSON.parse(JSON.stringify(req.body));
            if (serverDetailsJSON.server_details['log_enable'] == true) {
                logger.info(`routes GET: /driver/location`);
                logger.info(`location_details:radious-` + radious);
                logger.info(`location_details:field-` + field);
            }
              driverLocationControler.getNearestDrivers(locationDetails).then(data=>{
                 res.status(200).send({ message: "returned data" });
             }).catch(error => {
                 logger.info(error);
                 res.status(500).send({ message: "Error:- " + error });
             }) 
        })
    })
})



module.exports = router;