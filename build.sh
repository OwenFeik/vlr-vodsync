ROOT=$(dirname "$0")
BUILD="$ROOT/build"

mkdir -p "$BUILD"

# Firefox extension (just need to zip up)
FIREFOX="$BUILD/vlr-vodsync.xpi"
zip -j "$FIREFOX" extension/* > /dev/null
echo "Built Firefox extension at $FIREFOX"

# Chrome extension (need to remove manifest key)
CHROME="$BUILD/chrome"
mkdir -p "$CHROME"
cp extension/* "$CHROME/"
python3 - << SCRIPT
import json
with open('$CHROME/manifest.json', 'r+') as f:
    data = json.load(f)
    del data['browser_specific_settings']
    f.seek(0)
    json.dump(data, f, indent=4)
    f.truncate()
SCRIPT
echo "Built Chrome extension at $CHROME"
