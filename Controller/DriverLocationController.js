var logger = require('../Controller/LogController');
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");
var firebase = require("firebase-admin");
var app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://muve-driver-location-service.firebaseio.com"
});
var db = firebase.database();
var ref = db.ref("restricted_access/secret_document");
var DriverLocationController = function () {
    this.storeLocationDetails_firebase = (body) => {
        return new Promise((resolve, reject) => {
            logger.generateLog().then(log => {
                let loggerFile = log.getLogger('locationService');
                try {
                    loggerFile.info('initializeApp firebase app');
                    var driverid = body.location_details.driverid;
                    var longitude = body.location_details.longitude;
                    var latitude = body.location_details.latitude;
                    var bookingid = body.location_details.bookingid;
                    var response = writeUserData(driverid, longitude, latitude, bookingid);
                    if (response) {

                        var resObj = {
                            Longitude: longitude,
                            Latitude: latitude, 
                            Bookingid: bookingid ,
                            Driverid:driverid
                        }; 
                        loggerFile.info(JSON.stringify(resObj));
                        resolve()
                    } else {
                        loggerFile.info(response);
                        reject(error);
                    }
                } catch (err) {
                    loggerFile.error(err);
                    reject(err);
                }
            })

        })
    }
}

function writeUserData(cur_driverId, cur_longitude, lcur_latitude, cur_bookingId) {
    return new Promise((resolve, reject) => {
        logger.generateLog().then(log => {
            let loggerFile = log.getLogger('locationService');

            db.ref('drivers/locations' + cur_driverId).set({
                longitude: cur_longitude,
                latitude: lcur_latitude,
                bookingId: cur_bookingId,
                driverId: cur_driverId
            }, function (error) {
                if (error) {
                    reject(error)
                } else {
                    resolve();
                }
            });
        })
    })
}
module.exports = new DriverLocationController();