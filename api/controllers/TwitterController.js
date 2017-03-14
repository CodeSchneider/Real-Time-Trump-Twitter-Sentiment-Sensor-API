var moment = require('moment');

module.exports = {

  history: function(req,res,next) {
    var upperLimit = moment().format();
    var lowerLimit = moment(upperLimit).subtract({'hour': 1}).format();
    Tweet.find().where( { createdAt: { '>': lowerLimit } } ).exec(function(err,tweets){
      if (err) {
        return sails.log.error(err);
      }
      TweetService.tickMassage(tweets, upperLimit, function(err,tweets){
        if (err) {
          sails.log.error(err);
        }
        return res.send(tweets);
      });
    });
  },

  recent: function(req,res,next) {
    Tweet.find().sort('createdAt DESC').limit(10).exec(function(err,tweets){
      if (err) {
        sails.log.error(err);
      }
      return res.send(tweets);
    });
  }
}
