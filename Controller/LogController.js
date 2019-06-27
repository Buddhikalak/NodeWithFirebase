var log4js = require('log4js');
var configService = require('../Service/ConfigService');

var LogController = function () {
    this.generateLog = function () {
        return new Promise((resolve, reject) => {
            configService.getHostDetails().then(hostInfo => {
                var serverDetailsJSON = JSON.parse(hostInfo);
                log4js.configure({
                    appenders: {
                        locationService: { type: 'file', filename: 'public/logs/locationService.log', maxLogSize: 990485760, backups: 20, compress: true },
                    },
                    categories: {
                        default: { appenders: ['locationService'], level: serverDetailsJSON.server_details['log_level'] },
                    }
                });
                resolve(log4js);
            })  
        })
    }
}

module.exports = new LogController();