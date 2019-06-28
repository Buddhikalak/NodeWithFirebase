var logger = require('../Controller/LogController');
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");
var firebase = require("firebase-admin");
var gfire = require("geofire");
var app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://muve-driver-location-service.firebaseio.com"
});
var firebaseRef = firebase.database().ref("drivers/").push();
var geofire = new gfire.GeoFire(firebaseRef);
var geoQuery;
var db = firebase.database();
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
                    var updatedTimestamp = Date.now();
                    var response = writeUserData(driverid, longitude, latitude, bookingid, updatedTimestamp);
                    if (response) {

                        var resObj = {
                            Longitude: longitude,
                            Latitude: latitude,
                            Bookingid: bookingid,
                            Driverid: driverid
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
    this.getNearestDrivers = (body) => {
        return new Promise((resolve, reject) => {
            logger.generateLog().then(log => {
                let loggerFile = log.getLogger('locationService');
                try {
                    var gfire = require("geofire");
                    var firebaseRef = firebase.database().ref("/gajamatics");
                    var geofire = new gfire.GeoFire(firebaseRef);

                    var driversRef = db.ref("drivers/");
                    var final_result = [];
                    driversRef.on("value", function (snapshot) {
                        let object_container = Object.entries(JSON.parse(JSON.stringify(snapshot.val())));
                        object_container.forEach(element => {
                            if (element[1] != null) {
                                
                                geofire.set(element[1].driverId, [parseFloat(element[1].latitude), parseFloat(element[1].longitude)]).then(function () { }, function (error) {
                                    console.log("Error: " + error);
                                });
                            }
                        });
                        //1 latitude 2 longitude
                        geoQuery = geofire.query({
                            center: [6.9218124, 79.86556088],
                            radius: 10
                        });
                        geoQuery.on("key_entered", (key, location, distance) => {
                            console.log("ENTERED: " + key);
                            //this.fishPondKeys.push(key);
                        });
                        geoQuery.on("key_exited", (key, location, distance) => {
                            //let removeIndex = this.fishPondKeys.findIndex(x => x == key);
                            console.log("EXITED: " + key);
                            //this.fishPondKeys.splice(removeIndex,1);
                        });
                        resolve();
                    }, function (errorObject) {
                        loggerFile.error("The read failed: " + errorObject.code);
                        reject(err);
                    });
                } catch (err) {
                    loggerFile.error(err);
                    reject(err);
                }
            })
        })
    }
}

function writeUserData(cur_driverId, cur_longitude, lcur_latitude, cur_bookingId, updatedTimestamp) {
    return new Promise((resolve, reject) => {
        logger.generateLog().then(log => {
            let loggerFile = log.getLogger('locationService');
            db.ref('drivers/' + cur_driverId).set({
                longitude: cur_longitude,
                latitude: lcur_latitude,
                bookingId: cur_bookingId,
                driverId: cur_driverId,
                last_updated: updatedTimestamp
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