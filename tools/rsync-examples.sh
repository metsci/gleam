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

destRoot=${1:-}
if [ -z "$destRoot" ]; then
    echo -e " ${boldRed}*${normal} Usage: $0 <destination>"
    exit 1
fi

scriptDir=$(readlink -f "$(dirname "$0")")
topDir=$(readlink -f "$scriptDir/..")
utilPkgJson=$(convertPath "$topDir/packages/util/package.json")
gleamVersion=$(node -pe "require(\"$utilPkgJson\").version")

# Avoid accidentally pushing right after a version-bump
commitMessage=$(git log --pretty='%s' -1 HEAD)
if [[ "$commitMessage" == "Bump version to "* ]]; then
    echo -e " ${boldRed}*${normal} This looks like a version-bump commit (\"$commitMessage\")"
    echo -en " ${boldRed}*${normal} Continue anyway? [y/N] "
    read -n 1 shouldContinue
    echo -e ""
    if [ "$shouldContinue" != "y" -a "$shouldContinue" != "Y" ]; then
        echo "Aborted"
        exit 1
    fi
fi

# Add missing license headers
cd "$topDir"
npm run updateHeaders
if ! (git diff HEAD --exit-code >/dev/null); then
    git add "."
    git commit -m "Add missing license headers"
fi

# Verify that the versions all match
cd "$topDir"
for d in packages/* examples/*; do
    if [ -d "$topDir/$d" ]; then
        dPkgJson=$(convertPath "$topDir/$d/package.json")
        dVersion=$(node -pe "require(\"$dPkgJson\").version")
        if [ "$dVersion" != "$gleamVersion" ]; then
            echo -e " ${boldRed}*${normal} Version of $d doesn't match"
            exit 1
        fi
    fi
done

# Rebuild
cd "$topDir"
npm ci
npm run cleanFull
npm ci
npm run build

# Create an empty parent dir
rsync "/dev/null" "$destRoot/examples_$gleamVersion/" > "/dev/null"

# Rsync
cd "$topDir/examples"
for exampleName in *; do
    if [ -d "$topDir/examples/$exampleName" ]; then
        cd "$topDir/examples/$exampleName"
        rsync -rtv "./build/dist/" "$destRoot/examples_$gleamVersion/$exampleName/"
    fi
done

echo -e "\n${boldGreen}SUCCESS${normal}"
exit 0
