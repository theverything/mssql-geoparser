var FIGURE, FIGURE_V2, Point, SEGMENT, SHAPE, SHAPE_V2, parseFigures, parseGeography, parseM, parsePoints, parseSegments, parseShapes, parseZ;

FIGURE = {
  INTERIOR_RING: 0x00,
  STROKE: 0x01,
  EXTERIOR_RING: 0x02
};

FIGURE_V2 = {
  POINT: 0x00,
  LINE: 0x01,
  ARC: 0x02,
  COMPOSITE_CURVE: 0x03
};

SHAPE = {
  POINT: 0x01,
  LINESTRING: 0x02,
  POLYGON: 0x03,
  MULTIPOINT: 0x04,
  MULTILINESTRING: 0x05,
  MULTIPOLYGON: 0x06,
  GEOMETRY_COLLECTION: 0x07
};

SHAPE_V2 = {
  POINT: 0x01,
  LINESTRING: 0x02,
  POLYGON: 0x03,
  MULTIPOINT: 0x04,
  MULTILINESTRING: 0x05,
  MULTIPOLYGON: 0x06,
  GEOMETRY_COLLECTION: 0x07,
  CIRCULAR_STRING: 0x08,
  COMPOUND_CURVE: 0x09,
  CURVE_POLYGON: 0x0A,
  FULL_GLOBE: 0x0B
};

SEGMENT = {
  LINE: 0x00,
  ARC: 0x01,
  FIRST_LINE: 0x02,
  FIRST_ARC: 0x03
};

Point = (function() {
  function Point() {}

  Point.prototype.x = 0;

  Point.prototype.y = 0;

  Point.prototype.z = null;

  Point.prototype.m = null;

  return Point;

})();

parseGeography = function(buffer, geometry) {
  var flags, numberOfFigures, numberOfPoints, numberOfSegments, numberOfShapes, properties, srid, value;
  if (geometry == null) {
    geometry = false;
  }
  srid = buffer.readInt32LE(0);
  if (srid === -1) {
    return null;
  }
  value = {
    srid: srid,
    version: buffer.readUInt8(4)
  };
  flags = buffer.readUInt8(5);
  buffer.position = 6;
  properties = {
    Z: flags & (1 << 0) ? true : false,
    M: flags & (1 << 1) ? true : false,
    V: flags & (1 << 2) ? true : false,
    P: flags & (1 << 3) ? true : false,
    L: flags & (1 << 4) ? true : false
  };
  if (value.version === 2) {
    properties.H = flags & (1 << 3) ? true : false;
  }
  if (properties.P) {
    numberOfPoints = 1;
  } else if (properties.L) {
    numberOfPoints = 2;
  } else {
    numberOfPoints = buffer.readUInt32LE(buffer.position);
    buffer.position += 4;
  }
  value.points = parsePoints(buffer, numberOfPoints);
  if (properties.Z) {
    parseZ(buffer, value.points);
  }
  if (properties.M) {
    parseM(buffer, value.points);
  }
  if (properties.P) {
    numberOfFigures = 1;
  } else if (properties.L) {
    numberOfFigures = 1;
  } else {
    numberOfFigures = buffer.readUInt32LE(buffer.position);
    buffer.position += 4;
  }
  value.figures = parseFigures(buffer, numberOfFigures, properties);
  if (properties.P) {
    numberOfShapes = 1;
  } else if (properties.L) {
    numberOfShapes = 1;
  } else {
    numberOfShapes = buffer.readUInt32LE(buffer.position);
    buffer.position += 4;
  }
  value.shapes = parseShapes(buffer, numberOfShapes, properties);
  if (value.version === 2) {
    numberOfSegments = buffer.readUInt32LE(buffer.position);
    buffer.position += 4;
    value.segments = parseSegments(buffer, numberOfSegments);
  } else {
    value.segments = [];
  }
  return value;
};

parsePoints = function(buffer, count) {
  var i, point, points, _i;
  points = [];
  if (count < 1) {
    return points;
  }
  for (i = _i = 1; 1 <= count ? _i <= count : _i >= count; i = 1 <= count ? ++_i : --_i) {
    points.push((point = new Point));
    point.x = buffer.readDoubleLE(buffer.position);
    point.y = buffer.readDoubleLE(buffer.position + 8);
    buffer.position += 16;
  }
  return points;
};

parseZ = function(buffer, points) {
  var point, _i, _len, _results;
  if (points < 1) {
    return;
  }
  _results = [];
  for (_i = 0, _len = points.length; _i < _len; _i++) {
    point = points[_i];
    point.z = buffer.readDoubleLE(buffer.position);
    _results.push(buffer.position += 8);
  }
  return _results;
};

parseM = function(buffer, points) {
  var point, _i, _len, _results;
  if (points < 1) {
    return;
  }
  _results = [];
  for (_i = 0, _len = points.length; _i < _len; _i++) {
    point = points[_i];
    point.m = buffer.readDoubleLE(buffer.position);
    _results.push(buffer.position += 8);
  }
  return _results;
};

parseFigures = function(buffer, count, properties) {
  var figures, i, _i;
  figures = [];
  if (count < 1) {
    return figures;
  }
  if (properties.P) {
    figures.push({
      attribute: 0x01,
      pointOffset: 0
    });
  } else if (properties.L) {
    figures.push({
      attribute: 0x01,
      pointOffset: 0
    });
  } else {
    for (i = _i = 1; 1 <= count ? _i <= count : _i >= count; i = 1 <= count ? ++_i : --_i) {
      figures.push({
        attribute: buffer.readUInt8(buffer.position),
        pointOffset: buffer.readInt32LE(buffer.position + 1)
      });
      buffer.position += 5;
    }
  }
  return figures;
};

parseShapes = function(buffer, count, properties) {
  var i, shapes, _i;
  shapes = [];
  if (count < 1) {
    return shapes;
  }
  if (properties.P) {
    shapes.push({
      parentOffset: -1,
      figureOffset: 0,
      type: 0x01
    });
  } else if (properties.L) {
    shapes.push({
      parentOffset: -1,
      figureOffset: 0,
      type: 0x02
    });
  } else {
    for (i = _i = 1; 1 <= count ? _i <= count : _i >= count; i = 1 <= count ? ++_i : --_i) {
      shapes.push({
        parentOffset: buffer.readInt32LE(buffer.position),
        figureOffset: buffer.readInt32LE(buffer.position + 4),
        type: buffer.readUInt8(buffer.position + 8)
      });
      buffer.position += 9;
    }
  }
  return shapes;
};

parseSegments = function(buffer, count) {
  var i, segments, _i;
  segments = [];
  if (count < 1) {
    return segments;
  }
  for (i = _i = 1; 1 <= count ? _i <= count : _i >= count; i = 1 <= count ? ++_i : --_i) {
    segments.push({
      type: buffer.readUInt8(buffer.position)
    });
    buffer.position++;
  }
  return segments;
};

module.exports = {
  geography: function(buffer) {
    return parseGeography(buffer);
  },
  geometry: function(buffer) {
    return parseGeography(buffer, true);
  }
};
