ROOT=$(dirname $(realpath "$0"))
BUILD="$ROOT/build"

mkdir -p "$BUILD"
rm -rf "$BUILD/"*

CONTENT="extension/*.js extension/*.css extension/*.html"

# Firefox extension
FIREFOX="$BUILD/vlr-vodsync.xpi"
cp extension/firefox.json "build/manifest.json"
zip -j "$FIREFOX" "$BUILD/manifest.json" > /dev/null
cd "$ROOT/extension" && zip "$FIREFOX" icons/*.png > /dev/null && cd "$ROOT"
rm "$BUILD/manifest.json"
zip -j "$FIREFOX" $CONTENT > /dev/null
echo "Built Firefox extension at $FIREFOX"

# Chrome extension (unpacked)
CHROME="$BUILD/chrome"
mkdir -p "$CHROME"
cp extension/chrome.json "$CHROME/manifest.json"
cp -r $CONTENT "$CHROME/"
cp -r extension/icons/ "$CHROME/"
echo "Built Chrome extension at $CHROME"

# Chrome extension
PACKED="$BUILD/vlr-vodsync.zip"
zip -j "$PACKED" "$CHROME/"* > /dev/null
echo "Packed Chrome extension at $CHROME"
