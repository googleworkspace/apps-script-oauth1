var CONSUMER_KEY = '...';
var CONSUMER_SECRET = '...';

/**
 * Authorizes and makes a request to the Trello API.
 */
function run() {
  var service = getService();
  if (service.hasAccess()) {
    var url = 'https://api.trello.com/1/members/me/boards';
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
  var service = getService();
  service.reset();
}

/**
 * Configures the service.
 */
function getService() {
  return OAuth1.createService('Trello')
      // Set the endpoint URLs.
      .setRequestTokenUrl('https://trello.com/1/OAuthGetRequestToken')
      .setAuthorizationUrl('https://trello.com/1/OAuthAuthorizeToken')
      .setAccessTokenUrl('https://trello.com/1/OAuthGetAccessToken')

      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties());
}

/**
 * Handles the OAuth2 callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}
