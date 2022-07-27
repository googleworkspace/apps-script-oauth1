var CONSUMER_KEY = '...';
var CONSUMER_SECRET = '...';
var TOKEN = '...';
var TOKEN_SECRET = '...';

/**
 * Authorizes and makes a request to the Yelp API.
 */
function run() {
  var service = getService_();
  var url = 'https://api.yelp.com/v2/search?term=food&location=San+Francisco';
  var response = service.fetch(url);
  var result = JSON.parse(response.getContentText());
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Configures the service.
 */
function getService_() {
  return OAuth1.createService('Yelp')
      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

      // Manually set the token and secret, as provided by the Yelp developer
      // console.
      .setAccessToken(TOKEN, TOKEN_SECRET);
}
