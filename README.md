# xunithub

## Introduction

xunithub tries to save time you spend in analyzing test failures with your PR build. it simply goes through xunit report folder,
parses all report files to find test failures, and then post those failures to github as PR comment.Its completely test framework
agnostic, and only relies on xunit reporting standard. if your framework outputs xunit reports, and you use github as your code
repository,you can use xunithub.

## Usage

xunithub -g https://api.github.com/repos/(org/repo) -k (Github Access Token) -p (Github PR ID) -t (Xunit Test folder)

xunithub -g https://api.github.com/repos/proverma/arrow -k XXXXXXXXXXXXXXXXXXXXXXX -p 4 -t ~/Work/test-xunit

## Usage without API key

If you do not want to use an API key, you can use a username and password, or username and MFA token, by including it in the repo url like so:

xunithub -g https://username:password@api.github.com/repos/(org/repo) -p (Github PR ID) -t (Xunit Test folder)

xunithub -g https://proverma:XXXXXXXX@api.github.com/repos/proverma/arrow -p 4 -t ~/Work/test-xunit

## Example Report

Here is an example of what a report looks like in Github:

### Failures
#### YourTestSuite.xml (1) 
+ __Test Class Name :__ _YourTestSuite - YourTest_
+ __Test Case Name :__ _should not fail_
+ __Failure Message :__

   ```
undefined is not an object: myObject.myProperty
   ```
   ___
___

## Help

### How to create Github Access token

https://help.github.com/articles/creating-an-access-token-for-command-line-use/
