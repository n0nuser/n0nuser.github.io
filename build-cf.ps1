param(
    [string]$HugoVersion = "0.159.1",
    [switch]$PullLatest
)

$ErrorActionPreference = "Stop"

$Image = "hugomods/hugo:debian-dart-sass-node-git-non-root-$HugoVersion"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is not installed or not in PATH."
}

if ($PullLatest) {
    docker pull $Image
}

docker run --rm -v "${PWD}:/src" -w /src $Image hugo version
docker run --rm -v "${PWD}:/src" -w /src $Image hugo --gc --minify --destination /tmp/public --noBuildLock
