var request = require('request');
var fs = require('fs');
var config = require('dotenv').config();

// Git authentication
var GITHUB_USER = config.parsed.GITHUB_USER;
var GITHUB_TOKEN = config.parsed.GITHUB_TOKEN;

// Global values
var dir = './avatars/';

//  This function will use the request library
// to programmatically fetch the list of contributors
// via HTTPS for the given repo.
function getRepoContributors(repoOwner, repoName, callback) {
  var options = {
    url: 'https://'
      + GITHUB_USER + ':' + GITHUB_TOKEN
      + '@api.github.com/repos/'
      + repoOwner + '/' + repoName
      + '/contributors',
    headers: { 'User-Agent': 'request' }
  }
  var buff = '';
  request.get(options)
    .on('error', function(err) {
      // error occurs, output error and terminate
      console.error(err);
      process.exit();
    })
    .on('data', function(chunk) {
      // store every chunk in buffer
      buff += chunk;
    })
    .on('end', function() {
      // when reading data is done
      // do something with my buffer
      console.log('Downloading image...');
      callback(JSON.parse(buff));
    });
}

 // This function download a image and save it in a file
 // inputs:
 //   - url: specifies where the image is store
 //   - filePath: specifies where the
function downloadImageByURL(url, filePath) {
  // if the directory does not exist, create it
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  request.get(url)
    .on('error', function(err) {
      // error occurs, output error and terminate
      console.error(err);
      process.exit();
    })
    .pipe(fs.createWriteStream(filePath))
    .on('finish', function() {
      console.log('Image saved at', filePath);
    });
}

function loop(arr) {
  // loop through every object in the array
  arr.forEach(function(obj) {
    // generate file path based on the user name
    var filePath = dir + obj.login + '.jpg'
    downloadImageByURL(obj.avatar_url, filePath);
  });
}

function start() {
  // if owner or repo is missing
  // output error, process terminates
  if (!process.argv[2] || !process.argv[3]) {
    console.error('Please specify both repo owner and repo name');
    process.exit();
  }
  getRepoContributors(process.argv[2], process.argv[3], loop);
}

console.log('Welcome to Github Avatar Downloader!');
start();