#!/bin/bash

set -euo pipefail

boldGreen="\e[32;1m"
boldYellow="\e[33;1m"
boldRed="\e[31;1m"
boldNormal="\e[0;1m"
normal="\e[0m"

# Node for Windows needs Windows paths, not MSYS/Cygwin paths
function convertPath {
    if [ "$(node -pe "process.platform")" == "win32" -a "$(type -P cygpath)" ]; then
        cygpath -m "$1"
    else
        echo "$1"
    fi
}

newVersion=${1:-}
if [ -z "$newVersion" ]; then
    echo -e " ${boldRed}*${normal} Usage: $0 [ <new-version> | major | minor | patch | premajor | preminor | prepatch | prerelease ]"
    echo -e "    e.g.: $0 prerelease"
    exit 1
fi

scriptDir=$(readlink -f "$(dirname "$0")")
topDir=$(readlink -f "$scriptDir/..")
cd "$topDir"

utilPkgJson=$(convertPath "$topDir/packages/util/package.json")
currVersion=$(node -pe "require(\"$utilPkgJson\").version")

# Verify that the working copy is clean
if ! (git diff HEAD --exit-code >/dev/null); then
    echo -e " ${boldRed}*${normal} Working copy is not clean"
    exit 1
fi

# Add missing license headers
npm run updateHeaders
if ! (git diff HEAD --exit-code >/dev/null); then
    git add "."
    git commit -m "Add missing license headers"
fi

# Verify that current versions all match
for d in packages/* examples/*; do
    if [ -d "$topDir/$d" ]; then
        dPkgJson=$(convertPath "$topDir/$d/package.json")
        dVersion=$(node -pe "require(\"$dPkgJson\").version")
        if [ "$dVersion" != "$currVersion" ]; then
            echo -e " ${boldRed}*${normal} Current version of $d doesn't match"
            exit 1
        fi
    fi
done

# Verify that nothing is broken
npm run cleanFull
npm ci
npm run test

# Temporarily replace wildcard dep versions with actual versions
npm run concretizeDepVersions

# Create tarballs
npm pack -w "packages/**"

# Revert to original dep versions
git stash push -m "Concretize wildcard dep versions"

# Tag current commit, then bump version
git tag "$currVersion"
npm version "$newVersion" --no-git-tag-version -ws
newVersion=$(node -pe "require(\"$utilPkgJson\").version")
git add "."
git commit -m "Bump version to $newVersion"

# Report
echo -e "\n${boldGreen}SUCCESS${normal}"
