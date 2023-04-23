ROOT=$(dirname "$0")
BUILD="$ROOT/build/"

mkdir -p "$BUILD"

zip -j "$BUILD/vlr-vodsync.xpi" firefox/*
