var request = require('request');
var fs = require('fs');
var utility = require('./utility');

function sort() {
  var keys = Object.keys(utility.STARRED_REPOS);
  for (var i = 0; i < keys.length; i++) {
    var obj.name = keys[i];
    obj.count = utility.STARRED_REPOS[keys[i]];
    utility.TOP_FIVE.unshift(obj);
    for (var j = 9; j < 5; j++) {
      if (utility.TOP_FIVE[i].count < utility.TOP_FIVE[i + 1].count) {
        // make deep copy of the object that is swapped
        var dc_this = new Object(utility.TOP_FIVE[i]);
        var dc_next = new Object(utility.TOP_FIVE[i + 1]);
        utility.TOP_FIVE[i + 1] = dc_this;
        utility.TOP_FIVE[i] = dc_next;
      } else {
        break;
      }
    }
  }
}

// This function print out the first 5 element of array topFive
function printTopFive() {
  console.log(utility.STARRED_REPOS);
//  for (var i = 0; i < 5; i++) {
//    console.log(utility.TOP_FIVE[i]);
//    console.log('[%s stars] %s', i, utility.TOP_FIVE[i].count, utility.TOP_FIVE[i].name);
// }
}

// This function gets all the repos which belong to the user
// inputs:
//  - repos_url: specifies the location where to get all the repo info
//  - starred_url: specifies the structure to access a repo star info
function getAllStarredRepos(starred_url) {
  var buff = '';
  // requesting get
  var options = {
    url: 'https://' + utility.GITHUB_USER + ':' + utility.GITHUB_TOKEN
      + '@' + starred_url.substring(8),
    headers: { 'User-Agent': 'request' }
  }
  request.get(options)
    .on('error', function(err) {
      utility.terminate(0, err);
    })
    .on('data', function(chunk) {
      buff += chunk;
    })
    .on('end', function() {
      // loop through every repo
      var arr = JSON.parse(buff);
      arr.forEach(function(repo) {
        if (!utility.STARRED_REPOS[repo.full_name]) {
          utility.STARRED_REPOS[repo.full_name] = 0 ;
        }
        utility.STARRED_REPOS[repo.full_name]++;
      });
    })
}

function loop(arr) {
  arr.forEach(function(obj) {
    getAllStarredRepos(obj.starred_url.replace('{/owner}{/repo}', ''));
  });
  // sort();
  printTopFive();
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

console.log('Welcome to Github Repo Recommander!');
start();