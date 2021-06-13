import * as core from "@actions/core"
import * as validUrl from 'valid-url'
import axios from 'axios'

enum NotificationType {
	text = 'text',
	notification = 'notification'
}

interface PushNotification {
	type: NotificationType
	devices: string[]
	content: string
	url?: string
	silent: boolean
}

try {
	// Gather inputs
	const apiToken = core.getInput('api token'),
		appToken = core.getInput('app token'),
		appPackage = core.getInput('package'),
		deviceIDsRaw = core.getInput('device ids'),
		notification = core.getInput('notification'),
		url = core.getInput('url'),
		silent = core.getInput('silent') == 'true',
		failOnError = core.getInput('fail on error') == 'true'

	// Log
	core.debug('Sending notification…')
	core.debug(`Notification: ${notification}`)
	core.debug(`URL: ${url || 'NULL'}`)
	core.debug(`Silent? ${JSON.stringify(silent)}`)
	core.debug(`Fail on error? ${JSON.stringify(failOnError)}`)
	
	let urlIsValid = validUrl.isUri(url)
	let devices = deviceIDsRaw.split(',').map(d => d.trim()).filter(d => !!d)
	
	let pushNotification: PushNotification = {
		type: urlIsValid ? NotificationType.notification : NotificationType.text,
		devices,
		content: notification,
		url: urlIsValid ? url : null,
		silent
	}
	
	// Configure axios
	const pushNotifier = axios.create({
		baseURL: 'https://api.pushnotifier.de/v2',
		auth: {
			username: appPackage,
			password: apiToken
		}
	})
	
	pushNotifier.defaults.headers.common['X-AppToken'] = appToken
	pushNotifier.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8'
	
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
		core.setOutput('status', 'ok')
	}).catch(e => {
		if (e.response) {
			if (e.response.status == 404) {
				if (failOnError) {
					core.setFailed('The notification could not be delivered to at least one device.')
				} else {
					core.setOutput('status', 'failed')
				}
			} else {
				core.setFailed(e.message + ': ' + JSON.stringify(e.response.data))
			}
		} else {
			core.setFailed(e.message)
		}
	})
} catch (e) {
	core.setFailed(e.message)
}
