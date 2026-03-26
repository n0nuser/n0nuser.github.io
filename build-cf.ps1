param(
    [string]$HugoVersion = "0.159.1"
)

$ErrorActionPreference = "Stop"

$Image = "hugomods/hugo:debian-dart-sass-node-git-non-root-$HugoVersion"

docker run --rm -v "${PWD}:/src" -w /src $Image hugo --gc --minify --noTimes
