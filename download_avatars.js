var request = require('request');
var fs = require('fs');
var config = require('dotenv').config();

// Global values
var dir = './avatars/';
var GITHUB_USER;
var GITHUB_TOKEN;

function init() {
    // Git authentication
  if (config.error) {
    terminate(-1, null);
  }
  GITHUB_USER = config.parsed.GITHUB_USER;
  GITHUB_TOKEN = config.parsed.GITHUB_TOKEN;
  if (!GITHUB_USER || !GITHUB_TOKEN) {
    terminate(-2, null);
  }
}

function terminate(code, err) {
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

//  This function will use the request library
// to programmatically fetch the list of contributors
// via HTTPS for the given repo.
function getRepoContributors(repoOwner, repoName, callback) {
  // requesting get
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

// This function download a image and save it in a file
// inputs:
//   - url: specifies where the image is store
//   - filePath: specifies where the
function downloadImageByURL(url, filePath) {
  // if the directory does not exist, create it
  if (!fs.existsSync(dir)) {
    console.log('Warning:', dir, 'does not exist, new directory created.');
    fs.mkdirSync(dir);
  }

  // requesting get
  var options = {
    url: 'https://' + GITHUB_USER + ':' + GITHUB_TOKEN
      + '@' + url.substring(8),
    headers: { 'User-Agent': 'request' }
  }
  request.get(url)
    .on('error', function(err) {
      terminate(0, err);
    })
    .pipe(fs.createWriteStream(filePath))
    .on('finish', function() {
      console.log('Image saved at', filePath);
    });
}

function loop(arr) {
  // loop through every object in the array
  console.log('Downloading image...');
  arr.forEach(function(obj) {
    // generate file path based on the user name
    var filePath = dir + obj.login + '.jpg'
    downloadImageByURL(obj.avatar_url, filePath);
  });
}

function start() {
  // if owner or repo is missing
  // output error, process terminates
  if (process.argv.length !== 4) {
    terminate(-5, null);
  }
  init();
  getRepoContributors(process.argv[2], process.argv[3], loop);
}

console.log('Welcome to Github Avatar Downloader!');
start();