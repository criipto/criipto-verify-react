#!/usr/bin/env bash
set -e

if [[ `git status --porcelain` ]];
then
    echo "There are still changes present. Please commit those before updating version."
    exit 1
fi

defaultBranch="master"
currentBranch=$(git branch --show-current)
if [[ ${currentBranch} != ${defaultBranch} ]];
then
    echo "Currently not on default branch. Please checkout ${defaultBranch} before retrying."
    exit 1
fi

if [[ $# != 1 ]];
then
    echo "Incorrect number of arguments provided. Usage: ./bump-versions.sh <major | minor | patch>"
    exit 1
fi

# validate the version argument
case "$1" in
    major|minor|patch)
        ;;
    *)  echo "Invalid version bump argument provided. Usage ./bump-versions.sh <major | minor | patch>"
        exit 1
        ;;
esac

npm version $1 -m "v%s"