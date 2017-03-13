var cuid = require('cuid');

module.exports = {

  autoPK: false,

  attributes: {

    id: {
        type: 'string',
        primaryKey: true,
        defaultsTo: function (){ return cuid(); },
        unique: true,
        index: true
    },

    text: {
      type: 'string',
      size: '2000'
    },

    picture: {
      type: 'string'
    },

    sentiment: {
      type: 'string'
    }
  }
};
