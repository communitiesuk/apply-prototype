# GOV.UK prototype kit notifications plugin

When working on a prototype for a service recently, we had a requirement to test SMS messages and emails being sent to the user as part of the user journey. To test this within the bounds of the [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk/) I created phone and notifications in overlays in CSS to simulate the receipt of these messages.

![Example of phone and email notifications](./screenshot-demo.gif?raw=true)

## Overview

There are currently two notifications available `govukNotificationsPhone` and `govukNotificationsEmail` and I plan to add more with greater flexibility later. The email notification also adapts to Mac and Windows, and I'm planning to add iOS/Android support soon.


| SMS overlay                                           | Email overlay (Mac)                                           | Email overlay (Windows)                                         |
| ----------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- |
| ![SMS overlay](./screenshot-phone-macos.png?raw=true) | ![Email overlay (Mac)](./screenshot-email-macos.png?raw=true) | ![Email overlay (Windows)](./screenshot-email-win.png?raw=true) |

## Installation

To install, open a terminal window within your prototype and run `npm install govuk-notifications`.

## Usage

To use a a notification within your prototype:
* Insert `{% from "govukNotifications/components/email.njk" import "govukNotificationsEmail" %}` or `{% from "govukNotifications/components/phone.njk" import "govukNotificationsPhone" %}` at the top of your page.
* Somewhere outside of your content (usually at the top of the page in the `beforeContent` block) use `{{ govukNotificationsEmail('Sender', 'Subject line) }}` or `{{ govukNotificationsPhone('Sender', 'Body content') }}` (replacing the 'Sender' with the name of your sender, and the subject/content to your content).

## Updating

To update, go to `http://localhost:3000/manage-prototype/plugins-installed` and hit the update button.

![Update view](./screenshot-update.png?raw=true)
