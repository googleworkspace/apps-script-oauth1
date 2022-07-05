var CONSUMER_KEY = '...';
var CONSUMER_SECRET = '...';

/**
 * Authorizes and makes a request to the TripIt API.
 */
function run() {
  var service = getService_();
  if (service.hasAccess()) {
    var url = 'https://api.tripit.com/v1/get/profile?format=json';
    var response = service.fetch(url);
    var result = JSON.parse(response.getContentText());
    Logger.log(JSON.stringify(result, null, 2));
  } else {
    var authorizationUrl = service.authorize();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
  }
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  var service = getService_();
  service.reset();
}

/**
 * Configures the service.
 */
function getService_() {
  return OAuth1.createService('TripIt')
      // Set the endpoint URLs.
      .setRequestTokenUrl('https://api.tripit.com/oauth/request_token')
      .setAuthorizationUrl('https://www.tripit.com/oauth/authorize')
      .setAccessTokenUrl('https://api.tripit.com/oauth/access_token')

      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the OAuth version (default: 1.0a)
      .setOAuthVersion('1.0');
}

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService_();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}
