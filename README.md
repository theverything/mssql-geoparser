# MSSQL GeoParser

This is a parser for MSSQL geography and geometry data types.

It was abstracted from [node-mssql](https://github.com/patriksimek/node-mssql/blob/master/src/udt.coffee).

It exposes 2 methods `geography` and `geometry` which both take a buffer as the only argument.

## Installation

    npm install mssql-geoparser

## Usage

```javascript
var geoparser = require('mssql-geoparser');

var geometry = geoparser.geometry(buffer);
var geography = geoparser.geography(buffer);
```

## Returned object.

```javascript
{
  srid: 4326,
  version: 1,
  points: [
    {
      x: 47.6097,
      y: -122.3331
    }
  ],
  figures: [
    {
      attribute: 1,
      pointOffset: 0
    }
  ],
  shapes: [
    {
      parentOffset: -1,
      figureOffset: 0,
      type: 1
    }
  ],
  segments: [ ]
}
```

## License

Copyright (c) 2015

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
