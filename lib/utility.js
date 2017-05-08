var request = require('request');
var config = require('dotenv').config();

var terminate = function(code, err) {
  switch (code) {
    case -1:
      console.log('Error: .env file does not exist.');
      break;
    case -2:
      console.log('Error: .env file is missing information.');
      break;
    case -3:
      console.log('Error: .env file contains incorrect credentials.');
      break;
    case -4:
      console.log('Error: Provided owner/repo does not exist.');
      break;
    case -5:
      console.log('Error: Please specify both repo owner and repo name.');
      break;
    default:
      console.error(err);
  }
  console.log("Process Terminated.");
  process.exit();
}

module.exports = {
  GITHUB_USER: '',

  GITHUB_TOKEN: '',

  init: function () {
      // Git authentication
    if (config.error) {
      terminate(-1, null);
    }
    this.GITHUB_USER = config.parsed.GITHUB_USER;
    this.GITHUB_TOKEN = config.parsed.GITHUB_TOKEN;
    if (!this.GITHUB_USER || !this.GITHUB_TOKEN) {
      terminate(-2, null);
    }
  },

  terminate: terminate,

  //  This function will use the request library
  // to programmatically fetch the list of contributors
  // via HTTPS for the given repo.
  getRepoContributors: function(repoOwner, repoName, callback) {
    // requesting get
    var options = {
      url: 'https://'
        + this.GITHUB_USER + ':' + this.GITHUB_TOKEN
        + '@api.github.com/repos/'
        + repoOwner + '/' + repoName
        + '/contributors',
      headers: { 'User-Agent': 'request' }
    };
    var buff = '';
    request.get(options)
      .on('error', function(err) {
        // error occurs, output error and terminate
        console.error(err);
        process.exit();
      })
      .on('response', function(response) {
        if (response.statusCode === 400
          || response.statusCode === 401
          || response.statusCode === 403) {
          terminate(-3, null);
        }
        if (response.statusCode === 404) {
          terminate(-4, null);
        }
      })
      .on('data', function(chunk) {
        // store every chunk in buffer
        buff += chunk;
      })
      .on('end', function() {
        // when reading data is done
        // do something with my buffer
        callback(JSON.parse(buff));
      });
  }
}