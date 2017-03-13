module.exports.bootstrap = function(cb) {

  var Twitter = require('twitter');
  var sentiment = require('sentiment');

  var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY || sails.config.twitter.consumer_key,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET || sails.config.twitter.consumer_secret,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY || sails.config.twitter.access_token_key,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || sails.config.twitter.access_token_secret
  });

  var stream = client.stream('statuses/filter', {track: 'donald trump'});

  stream.on('data', function(event) {
    var r = sentiment(event.text);
    var picture_url = event.user.profile_image_url;
    var text = event.text;
    TweetService.saveTweet(r, picture_url, text, function(err,tweet){
      if (err) {
        sails.log.error(err);
      }
      return;
    });
  });

  stream.on('error', function(error) {
    sails.log.error(error);
  });

  setInterval(function() {
    TweetService.getTickData(function(err,tick){
      if (err) {
        sails.log.error(err);
      }
      sails.sockets.blast('tick', tick[0]);
    })
  }, 2000);

  setInterval(function() {
    TweetService.getRecentTweets(function(err,tweets){
      if (err) {
        sails.log.error(err);
      }
      sails.sockets.blast('newRecentTweets', tweets);
    });
  }, 5000);

  cb();
};
