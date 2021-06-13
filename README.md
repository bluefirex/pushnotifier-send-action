# PushNotifier GitHub Action

A simple GitHub Action to send notifications to many platforms and systems, such as iOS, macOS, Android, Telegram and more.

## Usage

Add a PushNotifier step to your workflow to send a notification:

```yaml
    steps:
      # ……your other steps…
      - name: Send push notification
        id: pushnotifier
        uses: bluefirex/pushnotifier-send-action
        with:
          api-token: ${{ secrets.PUSHNOTIFIER_API_TOKEN }}
          app-token: ${{ secrets.PUSHNOTIFIER_APP_TOKEN }}
          package: com.example.your-app
          device-ids: aBcD, xyZ
          notification: Workflow completed
          url: https://github.com/${{ github.repository }}
```

These inputs (`with`) are available (booleans must be passed as strings, e.g. `'true'`):

- `api-token`: Your PushNotifier API token
- `app-token`: An app token identifying a specific account for your app
- `package`: Your app's package name, e.g. `com.example.your-app`
- `device-ids`: Comma-separated IDs of all recipient devices
- `notification`: The notification's content
- `url`: (optional) URL to something, presentation depends on recipient device
- `silent`: (optional) 'true' if no sound should be played on platforms where applicable, defaults to 'false'
- `fail-on-error`: (optional) 'true' if job should fail if the notification failed to be delivered to at least one device, defaults to 'false'

These outputs are available:

- `status`: Either `ok` if notification was delivered to all devices or `failed` if at least one device could not be reached.

## How to set up PushNotifier

1. If you haven't already, create an account at https://pushnotifier.de/signup. Then [download any PushNotifier app](https://pushnotifier.de/apps) or [create a virtual device](https://pushnotifier.de/devices/add), e.g. email or Telegram.
2. Enable API access at https://pushnotifier.de/account/api
3. Create a GitHub secret with the newly created API token, e.g. `PUSHNOTIFIER_API_TOKEN`, configure it in `api-token`
4. Create an API application. This identifies who the notification is coming from. I recommend creating an app per repository.
5. Configure your app's package name in `package`.
6. Create an App Token for your new app. **Warning: This token allows sending notifications to any device in your account.**
7. Create a GitHub secret with the newly created App Token, e.g. `PUSHNOTIFIER_APP_TOKEN`, configure it in `app-token`
8. For any device you want to send to, add that device's ID to `device-ids`. You can find the ID in [Your Devices](https://pushnotifier.de/devices) by clicking "Details" on any device. You're looking for ID V2.
9. Configure `notification` and `url` to your liking and you're good to go!

## How does `fail-on-error` work?

By default, your workflow job is not considered failed when your notification could not be delivered to one or more devices, as long
as everything else (tokens, app etc.) was correct. In case `fail-on-error` is 'false', you can react conditionally, e.g.:

```yaml
steps:
  # …
  
  - name: Send push notification
    id: pushnotifier
    uses: bluefirex/pushnotifier-send-action
      with:
        # …
        - fail-on-error: 'false'
        
  - name: Did the notification fail?
    if: ${{ steps.pushnotifier.outputs.status != 'ok' }}
    run: # do something if not delivered to all devices
    
  - name: …
-   # …
```
