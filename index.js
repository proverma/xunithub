#!/usr/bin/env node

/**
 * Module dependencies.
 */

var url = require('url')
    , argv = require('yargs')
            .usage('Usage: $0 -g [github repo url] -k[github api key] -p [github pr id] -t [test report folder path] ')
            .alias('g','github-repo-url')
            .alias('k','github-api-key')
            .alias('p','github-pr-id')
            .alias('t','test-report-folder')
            .demand(['g','k','p','t'])
            .argv
    , xunithub = require('./xunithub')
    , x = new xunithub()
    ;

//validating inputs

if (!isUrl(argv.g)) {
    errorOut("Invalid Github Repo Url :" + argv.g)
}


//execute
x.getFailures(argv.t).then(function(val){
    if (val.length > 0) {
        x.postReport(val, argv.g, argv.k, argv.p);
    } else {
        console.log("XunitHub : No failures found, nothing to post to Github")
    }

});


//utility methods
function isUrl (d) {
    if (!d) {
        return false;
    } else if ('string' === typeof d) {
        d = url.parse(d);
    } else if ('object' !== typeof d) {
        return false;
    } else if (!d.host || !d.pathname) {
        return false;
    }

    return true
}

function errorOut(msg) {
    console.error(msg);
    process.exit(1);
}

