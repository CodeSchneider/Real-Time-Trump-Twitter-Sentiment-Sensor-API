var moment = require('moment');
var emojiStrip = require('emoji-strip');
var _ = require('lodash');

module.exports = {

  getTickData: function(cb) {
    var __this = this;
    var upperLimit = moment().format();
    var lowerLimit = moment(upperLimit).subtract({'seconds': 2}).format();
    Tweet.find().where( { createdAt: { '<': upperLimit } } ).where( { createdAt: { '>': lowerLimit } } ).exec(function(err,tweets){
      if (err) {
        return cb(err, null);
      }
      __this.singleTickMassage(tweets, upperLimit, function(err,tick){
        if (err) {
          return cb(err, null);
        }
        return cb(null,tick);
      });
    });
  },

  getRecentTweets: function(cb) {
    Tweet.find().sort('createdAt DESC').limit(10).exec(function(err,tweets){
      if (err) {
        return cb(err, null);
      }
      return cb(null, tweets);
    });
  },

  saveTweet: function(sentiment, picture_url, text, cb) {
    if (sentiment.score > 0) {
      var sentiment = 'P';
    } else if (sentiment.score < 0) {
      var sentiment = 'N';
    } else {
      var sentiment = 'S';
    }
    Tweet.create( { sentiment: sentiment, picture: picture_url, text: emojiStrip(text) } ).exec(function(err,tweet){
      if (err) {
        return cb(err,null);
      }
      return cb(null,tweet);
    });
  },

  singleTickMassage: function(tweets, upperLimit, cb) {
    var tweets = {'plk':tweets};
    var __this = this;
    var tick = _.map(tweets, function(v, k) {
      var time = __this.getChartTime(v);
      return __this.addAbsentKeys(_.assign(_.countBy(v, 'sentiment'), {time: time}));
    });
    return cb(null, tick);
  },

  tickMassage: function(tweets, upperLimit, cb) {
    var __this = this;
    var dateGroups = _.chain(tweets)
      .groupBy(function(obj) { return Math.floor(+(obj.createdAt)/(1000*2)); })
      .map(function(v, k) {
        var time = __this.getChartTime(v);
        return __this.addAbsentKeys(_.assign(_.countBy(v, 'sentiment'), {time: time}));
      });
    return cb(null, dateGroups);
  },

  getChartTime: function(v) {
    var __this = this;
    var upperLimit = _.max(_.map(v, 'createdAt'));
    var hour = __this.pad(moment(upperLimit).hour(), 2);
    var min = __this.pad(moment(upperLimit).minutes(), 2);
    var seconds = __this.pad(moment(upperLimit).seconds(), 2);
    var chartTime = hour+':'+min+':'+seconds;
    return chartTime;
  },

  pad: function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  },

  addAbsentKeys: function(obj) {
    if (!('P' in obj)) {
      obj['P'] = 0;
    }
    if (!('S' in obj)) {
      obj['S'] = 0;
    }
    if (!('N' in obj)) {
      obj['N'] = 0;
    }
    return obj;
  }
}
