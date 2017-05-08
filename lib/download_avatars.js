var request = require('request');
var fs = require('fs');
var utility = require('./utility');

// Global values
var dir = '../avatars/';

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
    url: 'https://' + utility.GITHUB_USER + ':' + utility.GITHUB_TOKEN
      + '@' + url.substring(8),
    headers: { 'User-Agent': 'request' }
  }
  request.get(url)
    .on('error', function(err) {
      utility.terminate(0, err);
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
    utility.terminate(-5, null);
  }
  utility.init();
  utility.getRepoContributors(process.argv[2], process.argv[3], loop);
}

console.log('Welcome to Github Avatar Downloader!');
start();