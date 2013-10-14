#!/bin/bash

#
# git version tag
#
ver=$(git tag -l "v*.*.*" | sort -r | head -n 1)
echo $ver
ver_major=$(echo $ver | sed -r 's/v([0-9]+)\.([0-9]+)\.(.*)/\1/')
ver_minor=$(echo $ver | sed -r 's/v([0-9]+)\.([0-9]+)\.(.*)/\2/')
ver_fix=$(echo $ver | sed -r 's/v([0-9]+)\.([0-9]+)\.(.*)/\3/')

echo $ver_major
echo $ver_minor  
echo $ver_fix

archive="";

case "$ver_fix" in 
    rc*)
		archive="fm-js-$ver_major.$ver_minor.$ver_fix, fm-js-$ver_major.$ver_minor-latest,fm-js-latest";;
	rel*)
		archive="fm-js-$ver_major.$ver_minor.$ver_fix, fm-js-$ver_major.$ver_minor,fm-js-latest";;
    *)
		archive="fm-js-latest";;
esac

echo $archive
