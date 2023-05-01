ROOT=$(dirname "$0")
BUILD="$ROOT/build"

mkdir -p "$BUILD"
rm -rf "$BUILD/"*

CONTENT="extension/*.js extension/*.css extension/*.html"

# Firefox extension (just need to zip up)
FIREFOX="$BUILD/vlr-vodsync.xpi"
cp extension/firefox.json "build/manifest.json"
zip -j "$FIREFOX" "$BUILD/manifest.json" > /dev/null
rm "$BUILD/manifest.json"
zip -j "$FIREFOX" $CONTENT > /dev/null
echo "Built Firefox extension at $FIREFOX"

# Chrome extension (need to remove manifest key)
CHROME="$BUILD/chrome"
mkdir -p "$CHROME"
cp extension/chrome.json "$CHROME/manifest.json"
cp $CONTENT "$CHROME/"
echo "Built Chrome extension at $CHROME"
