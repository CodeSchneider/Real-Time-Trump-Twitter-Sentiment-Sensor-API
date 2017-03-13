module.exports.routes = {
  'GET /twitter/history': {controller: 'TwitterController', action: 'history'},
  'GET /twitter/recent': {controller: 'TwitterController', action: 'recent'}
};
