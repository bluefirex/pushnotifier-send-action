"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const validUrl = __importStar(require("valid-url"));
const axios_1 = __importDefault(require("axios"));
var NotificationType;
(function (NotificationType) {
    NotificationType["text"] = "text";
    NotificationType["notification"] = "notification";
})(NotificationType || (NotificationType = {}));
try {
    // Gather inputs
    const apiToken = core.getInput('api token'), appToken = core.getInput('app token'), appPackage = core.getInput('package'), deviceIDsRaw = core.getInput('device ids'), notification = core.getInput('notification'), url = core.getInput('url'), silent = core.getInput('silent') == 'true', failOnError = core.getInput('fail on error') == 'true';
    // Log
    core.debug('Sending notification…');
    core.debug(`Notification: ${notification}`);
    core.debug(`URL: ${url || 'NULL'}`);
    core.debug(`Silent? ${JSON.stringify(silent)}`);
    core.debug(`Fail on error? ${JSON.stringify(failOnError)}`);
    let urlIsValid = validUrl.isUri(url);
    let devices = deviceIDsRaw.split(',').map(d => d.trim()).filter(d => !!d);
    let pushNotification = {
        type: urlIsValid ? NotificationType.notification : NotificationType.text,
        devices,
        content: notification,
        url: urlIsValid ? url : null,
        silent
    };
    // Configure axios
    const pushNotifier = axios_1.default.create({
        baseURL: 'https://api.pushnotifier.de/v2',
        auth: {
            username: appPackage,
            password: apiToken
        }
    });
    pushNotifier.defaults.headers.common['X-AppToken'] = appToken;
    pushNotifier.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
    // Let's go!
    pushNotifier({
        method: 'put',
        url: '/notifications/' + pushNotification.type,
        data: {
            devices: pushNotification.devices,
            content: pushNotification.content,
            url: pushNotification.url,
            silent: pushNotification.silent
        }
    }).then(() => {
        core.setOutput('status', 'ok');
    }).catch(e => {
        if (e.response) {
            if (e.response.status == 404) {
                if (failOnError) {
                    core.setFailed('The notification could not be delivered to at least one device.');
                }
                else {
                    core.setOutput('status', 'failed');
                }
            }
            else {
                core.setFailed(e.message + ': ' + JSON.stringify(e.response.data));
            }
        }
        else {
            core.setFailed(e.message);
        }
    });
}
catch (e) {
    core.setFailed(e.message);
}
