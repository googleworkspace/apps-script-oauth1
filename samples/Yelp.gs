var CONSUMER_KEY = '...';
var CONSUMER_SECRET = '...';
var TOKEN = '...';
var TOKEN_SECRET = '...';

/**
 * Authorizes and makes a request to the Yelp API.
 */
function run() {
  var service = getService();
  if (service.hasAccess()) {
    var url = 'https://api.yelp.com/v2/search?term=food&location=San+Francisco';
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
  return OAuth1.createService('Yelp')
      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

      // Manually set the token and secret, as provided by the Yelp developer
      // console.
      .setAccessToken(TOKEN, TOKEN_SECRET);
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
