var request = require('request');
var fs = require('fs');
var config = require('dotenv').config();
var utility = require('./utility');

// Global variable
var repos = {};

function recommandRepos(url) {
  var buff = '';
  // requesting get
  var options = {
    url: url,
    headers: { 'User-Agent': 'request' }
  }
  request.get(url)
    .on('error', function(err) {
      utility.terminate(0, err);
    })
    .on('data', function(chunk) {
      buff += chunk;
    })
    .on('end', function() {
      console.log(buff);
    })
}

function getAllRepos(repos_url, starred_url) {
  var buff = '';
  // requesting get
  var options = {
    url: 'https://' + utility.GITHUB_USER + ':' + utility.GITHUB_TOKEN
      + '@' + repos_url.substring(8),
    headers: { 'User-Agent': 'request' }
  }
  console.log(options.url);
  request.get(options)
    .on('error', function(err) {
      utility.terminate(0, err);
    })
    .on('data', function(chunk) {
      buff += chunk;
    })
    .on('end', function() {
      var arr = JSON.parse(buff);
      // arr.forEach(function(repo) {
      //   recommandRepos(starred_url.replace('{/owner}{/repo}', '/' + repo.full_name));
      // })
    })
}

function loop(arr) {
  arr.forEach(function(obj) {
    getAllRepos(obj.repos_url, obj.starred_url);
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