'use strict';

var fs = require('fs')
    , request = require('request')
    , parseString = require('xml2js').parseString
    , Entities = require('html-entities').AllHtmlEntities
    , entities = new Entities()
    , $q = require('q')
    , debug = require('debug')('xunithub')
    ;

/**
 * @constructor
 * @class
 */
function xunithub() {
}


/**
 * Parses all xunit reports file in the given folder and returns
 * promise list of all test failures found.
 *
 * @param reportDir ( Directory containing all xunit reports )
 * @return promise
 */
xunithub.prototype.getFailures = function (reportDir) {
    var xmlFiles = fs.readdirSync(reportDir)
        , failureList = []
        , self = this
        , failureMessages
        , errorObj
        , defer = $q.defer()
        ;

    debug("Files in the folder :" + xmlFiles);

    xmlFiles.forEach(function (fileName, index, arr) {
        if (fileName[0] === '.' || fileName.indexOf(".xml") === -1) {
            return;
        }
        debug("Report File :" + fileName);
        failureMessages = self._parseReport(fs.readFileSync(reportDir + '/' + fileName, 'utf8'));
        debug("Failure Message : " + failureMessages);
        failureMessages.then(function (val) {

            if (val.length > 0) {
                errorObj = {"fileName": fileName, "failures": val};
                failureList.push(errorObj);
            }

            if (arr.length - 1 == index) {
                defer.resolve(failureList);
            }
        });
    });

    return defer.promise;

};

/**
 * parses xunit report and returns error messages if found
 * this method gets called by getFailures
 *
 * @param data  (xunit report as string )
 * @return promise
 */
xunithub.prototype._parseReport = function (data) {
    var defer = $q.defer()
        , failureMessages = []
        , obj;

    parseString(data.toString(), function (err, result) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        try {
            result.testsuites.testsuite.forEach(function (testsuite) {
                testsuite.testcase = testsuite.testcase || [];
                testsuite.testcase.forEach(function (testcase) {
                    if (testcase.failure) {
                        obj = {};
                        obj.classname = testcase.$.classname;
                        obj.name = testcase.$.name;
                        obj.message = entities.decode(testcase.failure[0].$.message);
                        failureMessages.push(obj);
                    }
                });
            });
        } catch (e) {
            console.debug(e);
        }
        defer.resolve(failureMessages);
    });
    return defer.promise;
};

/**
 * converts all xunit failures into md format
 *
 * @param failureList ( array containing all test failures )
 * @return Error messages in markdown format
 */

xunithub.prototype.markDownConverter = function (failureList) {

    var errorMD = "";

    if (failureList) {
        errorMD += "## Failures" + "\n";
        failureList.forEach(function (file) {
            errorMD += "### " + file.fileName + " (" + file.failures.length + ") \n";
            file.failures.forEach(function (f) {
                errorMD += "+ __Test Class Name :__ _" + f.classname + "_\n";
                errorMD += "+ __Test Case Name :__ _" + f.name + "_\n";
                errorMD += "+ __Failure Message :__" + "\n\n" + "   ```" + "\n"
                + f.message + "\n" + "   ```" + "\n\n";
                errorMD += "    ___" + "\n";
            });
            errorMD += "___" + "\n";
        });
    }

    return errorMD

};

/**
 * converts failures into markdown format and posts them to github
 *
 * @param failureList ( array containing all test failures )
 * @param githubRepoUrl ( github repo url )
 * @param githubAPIkey ( github api key )
 * @param pullRequestID ( PR ID number , where the comment will be posted )
 * @return null
 */

xunithub.prototype.postReport = function (failureList, githubRepoUrl, githubAPIkey, pullRequestID) {

    var errorData = this.markDownConverter(failureList)
        , config = {
            url: githubRepoUrl + '/issues/' +
            pullRequestID + '/comments',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'git CL - node'
            },
            method: 'POST',
            json: {
                body: errorData
            }
        }
        ;
        
    if (githubAPIkey) {
        config.headers['Authorization'] = 'token ' + githubAPIkey;
    }
    request(config, function (error, response) {

        if (!error && response.statusCode < 205) {
            console.log("XunitHub : Comment Posted Successfully");
        } else {
            console.error("XunitHub : Error while posting, Recieved Http Status Code : " + response.statusCode);
        }
    });

};

module.exports = xunithub;
