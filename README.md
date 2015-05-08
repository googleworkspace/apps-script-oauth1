# OAuth1 for Apps Script

OAuth1 for Apps Script is a library for Google Apps Script that provides the
ability to create and authorize OAuth1 tokens. This library uses Apps Script's
new [StateTokenBuilder](https://developers.google.com/apps-script/reference/script/state-token-builder)
and `/usercallback` endpoint to handle the redirects.

*Note:* OAuth1 for Google APIs is
[deprecated](https://developers.google.com/accounts/docs/OAuth) and scheduled
to be shut down on April 20, 2015. For accessing Google APIs, use the
[Apps Script OAuth2 library instead](https://github.com/googlesamples/apps-script-oauth2).

## Setup

This library is already published as an Apps Script, making it easy to include
in your project. To add it to your script, do the following in the Apps Script
code editor:

1. Click on the menu item "Resources > Libraries..."
2. In the "Find a Library" text box, enter the project key
   "Mb2Vpd5nfD3Pz-_a-39Q4VfxhMjh3Sh48" and click the "Select" button.
3. Choose a version in the dropdown box (usually best to pick the latest
   version).
4. Click the "Save" button.


## Callback URL

Before you can start authenticating against an OAuth1 provider, you usually need
to register your application and retrieve the consumer key and secret. Often
these registration screens require you to enter a "Callback URL", which is the
URL that users will be redirected to after they've authorized the token. For
this library (and the Apps Script functionality in general) the URL will always
be in the following format:

    https://script.google.com/macros/d/{PROJECT KEY}/usercallback

Where `{PROJECT KEY}` is the key of the script that is using this library. You
can find your script's project key in the Apps Script code editor by clicking on
the menu item "File > Project properties".


## Usage

Using the library to generate an OAuth1 token has the following basic steps.

### 1. Create the OAuth1 service

The Service class contains the configuration information for a given
OAuth1 provider, including it's endpoints, consumer keys and secrets, etc. This
information is not persisted to any data store, so you'll need to create this
object each time you want to use it. The example below shows how to create a
service for the Twitter API.

    function getTwitterService() {
      // Create a new service with the given name. The name will be used when
      // persisting the authorized token, so ensure it is unique within the
      // scope of the property store.
      return OAuth1.createService('twitter')
          // Set the endpoint URLs.
          .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
          .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
          .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')

          // Set the consumer key and secret.
          .setConsumerKey('...')
          .setConsumerSecret('...')

          // Set the name of the callback function in the script referenced
          // above that should be invoked to complete the OAuth flow.
          .setCallbackFunction('authCallback')

          // Set the property store where authorized tokens should be persisted.
          .setPropertyStore(PropertiesService.getUserProperties());
    }

### 2. Create a request token and direct the user to the authorization URL

Apps Script UI's are not allowed to redirect the user's window to a new URL, so
you'll need to present the authorization URL as a link for the user to click.
The service's `authorize()` method generates the request token and returns the
authorization URL.

    function showSidebar() {
      var twitterService = getTwitterService();
      if (!twitterService.hasAccess()) {
        var authorizationUrl = twitterService.authorize();
        var template = HtmlService.createTemplate(
            '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
            'Reopen the sidebar when the authorization is complete.');
        template.authorizationUrl = authorizationUrl;
        var page = template.evaluate();
        DocumentApp.getUi().showSidebar(page);
      } else {
        ...
      }
    }

### 3. Handle the callback

When the user completes the OAuth1 flow, the callback function you specified
for your service will be invoked. This callback function should pass its
request object to the service's `handleCallback()` method, and show a message
to the user.

    function authCallback(request) {
      var twitterService = getTwitterService();
      var isAuthorized = twitterService.handleCallback(request);
      if (isAuthorized) {
        return HtmlService.createHtmlOutput('Success! You can close this tab.');
      } else {
        return HtmlService.createHtmlOutput('Denied. You can close this tab');
      }
    }

**Note:** In an Apps Script UI it's not possible to automatically close a window
or tab, so you'll need to direct the user to close it themselves.

### 4. Make authorized requests

Now that the service is authorized you can use it to make reqests to the API.
The service's `fetch()` method accepts the same parameters as the built-in
[`UrlFetchApp.fetch()`](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetch(String,Object))
and automatically signs the requests using the OAuth1 token.

    function makeRequest() {
      var twitterService = getTwitterService();
      var response = twitterService.fetch('https://api.twitter.com/1.1/statuses/user_timeline.json');
      ...
    }

## Compatiblity

This library was designed to work with any OAuth1 provider, but because of small
differences in how they implement the standard it may be that some APIs
aren't compatible. If you find an API that it does't work with, open an issue or
fix the problem yourself and make a pull request against the source code.

## Other features

#### Resetting the access token

If you have an access token set and need to remove it from the property store
you can remove it with the `reset()` function. Before you can call reset you
need to set the property store.

    function clearService(){
      OAuth1.createService('twitter')
          .setPropertyStore(PropertiesService.getUserProperties())
          .reset();
    }

#### Setting the request method and parameter location

OAuth1 providers may require that you use a particular HTTP method or parameter
location when performing the OAuth1 flow. You can use the methods `setMethod()`
and `setParamLocation()` to controls these settings.
