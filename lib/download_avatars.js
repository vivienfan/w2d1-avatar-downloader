var request = require('request');
var fs = require('fs');

var GITHUB_USER = 'vivienfan';
var GITHUB_TOKEN = 'f5990bbdc7e520d59a07d2bb9de13e37ad1f2a4d';

/* This function will use the request library
to programmatically fetch the list of contributors
via HTTPS for the given repo.  */
function getRepoContributors(repoOwner, repoName, callback) {
  var options = {
    url: 'https://'
      + GITHUB_USER + ':' + GITHUB_TOKEN
      + '@api.github.com/repos/'
      + repoOwner + '/' + repoName
      + '/contributors',

    headers: {
      'User-Agent': 'request'
    }
  }
  var buff = '';
  request.get(options)
    .on('error', function(err) {
      throw err;
    })
    .on('response', function(response) {
      console.log('%s: %s', response.statusCode, response.statusMessage);
    })
    .on('data', function(chunk) {
      buff += chunk;
    })
    .on('end', function() {
      var arr = JSON.parse(buff);
      arr.forEach(function(element) {
        callback(element.avatar_url);
      })
    });
}

console.log('Welcome to Github Avatar Downloader!');
getRepoContributors("jquery", "jquery", function(msg) {
  console.log(msg)
});