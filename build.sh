ROOT=$(dirname "$0")
BUILD="$ROOT/build"

mkdir -p "$BUILD"
rm -rf "$BUILD/"*

CONTENT="extension/*.js extension/*.css extension/*.html extension/*.png"

# Firefox extension
FIREFOX="$BUILD/vlr-vodsync.xpi"
cp extension/firefox.json "build/manifest.json"
zip -j "$FIREFOX" "$BUILD/manifest.json" > /dev/null
rm "$BUILD/manifest.json"
zip -j "$FIREFOX" $CONTENT > /dev/null
echo "Built Firefox extension at $FIREFOX"

# Chrome extension (unpacked)
CHROME="$BUILD/chrome"
mkdir -p "$CHROME"
cp extension/chrome.json "$CHROME/manifest.json"
cp $CONTENT "$CHROME/"
echo "Built Chrome extension at $CHROME"

# Chrome extension
PACKED="$BUILD/vlr-vodsync.zip"
zip -j "$PACKED" "$CHROME/"* > /dev/null
echo "Packed Chrome extension at $CHROME"
