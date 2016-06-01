var convict = require('convict');

var config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
    arg: 'env'
  },
  // mongo: {
  //   main: {
  //     doc: 'Main database',
  //     format: 'url',
  //     default: 'mongodb://...',
  //     env: 'MONGO_MAIN'
  //   },
  //   sessions: {
  //     doc: 'Sessions database',
  //     format: 'url',
  //     default: 'mongodb://...',
  //     env: 'MONGO_SESSIONS'
  //   }
  // },
  express: {
    ip: {
      doc: 'The IP address to bind.',
      format: 'ipaddress',
      default: '127.0.0.1',
      env: 'IP_ADDRESS',
    },
    http: {
      port: {
        doc: 'HTTP port to bind.',
        format: 'port',
        default: 3000,
        env: 'HTTP_PORT'
      }
    },
    https: {
      port: {
        doc: 'HTTPs port to bind.',
        format: 'port',
        default: 3443,
        env: 'HTTPS_PORT'
      }
    }
  }
});

// // load environment dependent configuration
// config.loadFile('./config/' + config.get('env') + '.json');

// validate
config.validate();

module.exports = config;
