var express = require('express');
var logger = require('./Controller/LogController');
//var log = logger.generateLog();
var configService = require('./Service/ConfigService');
/*Set up the express app */
const app = express();

configService.getHostDetails().then(hostInfo => {
    var serverDetailsJSON = JSON.parse(hostInfo);
    app.listen(serverDetailsJSON.server_details['port'], () => {
        logger.generateLog().then(log => {
            let logger = log.getLogger('locationService');
            if (serverDetailsJSON.server_details['log_enable']==true && (serverDetailsJSON.server_details['log_level'] == 'debug' || serverDetailsJSON.server_details['log_level'] == 'info')) {
                logger.info(`server running on port:` + serverDetailsJSON.server_details['port']);
            } else {
                logger.info(`server running on port:` + serverDetailsJSON.server_details['port']);
                logger.info("Log enable false");
            }
        })
    });
})

