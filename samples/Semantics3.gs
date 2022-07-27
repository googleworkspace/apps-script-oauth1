var API_KEY = '...';
var API_SECRET = '...';

/**
 * Authorizes and makes a request to the Semantics3 API.
 */
function run() {
  var service = getService_();
  var query = encodeURIComponent(JSON.stringify({
    search: 'iPhone'
  }));
  var url = 'https://api.semantics3.com/v1/products?q=' + query;
  var response = service.fetch(url);
  var result = JSON.parse(response.getContentText());
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Configures the service.
 */
function getService_() {
  return OAuth1.createService('Semantics3')
      // Set the consumer key and secret.
      .setConsumerKey(API_KEY)
      .setConsumerSecret(API_SECRET)

      // Manually set the token and secret to the empty string, since the API
      // uses 1-legged OAuth.
      .setAccessToken('', '');
}
