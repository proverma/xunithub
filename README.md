# xunithub

## Introduction

xunithub tries to save time you spend in analyzing test failures with your PR build. it simply goes through xunit report folder,
parses all report files to find test failures, and then post those failures to github as PR comment.Its completely test framework
agnostic, and only relies on xunit reporting standard. if your framework outputs xunit reports, and you use github as your code
repository,you can use xunithub.

## Usage

xunithub -g https://api.github.com/repos/(org/repo) -k (Github Access Token) -p (Github PR ID) -t (Xunit Test folder)

xunithub -g https://api.github.com/repos/proverma/arrow -k XXXXXXXXXXXXXXXXXXXXXXX -p 4 -t ~/Work/test-xunit


## Help

### How to create Github Access token

https://help.github.com/articles/creating-an-access-token-for-command-line-use/
