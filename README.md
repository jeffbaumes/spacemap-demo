SpaceMap demo
=============

To run locally with Python 2.7:

    python -m SimpleHTTPServer 8888 .

Swap out the `data.json` file to browse your own data.

Sample data file retrieved from:

    http://openweathermap.org/current

Specifically the call for current weather in a bounding box:

    http://api.openweathermap.org/data/2.5/box/city?bbox=12,32,15,37,15&cluster=no

To recreate a specific demo, set `nihDemo` to `true` in `index.js` and
set `data.json` appropriately.
