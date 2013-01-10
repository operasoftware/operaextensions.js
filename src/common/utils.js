
function isObjectEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}

/**
 * GENERAL OEX SHIM UTILITY FUNCTIONS
 */

/**
 * Chromium doesn't support complex colors in places so
 * this function will convert colors from rgb, rgba, hsv,
 * hsl and hsla in to hex colors.
 *
 * 'color' is the color string to convert.
 * 'backgroundColorVal' is a background color number (0-255)
 * with which to apply alpha blending (if any).
 */
function complexColorToHex(color, backgroundColorVal) {

  if(color === undefined || color === null) {
    return color;
  }

  // Force covert color to String
  color = color + "";

  // X11/W3C Color Names List
  var colorKeywords = { aliceblue: [240,248,255], antiquewhite: [250,235,215], aqua: [0,255,255], aquamarine: [127,255,212],
  azure: [240,255,255], beige: [245,245,220], bisque: [255,228,196], black: [0,0,0], blanchedalmond: [255,235,205],
  blue: [0,0,255], blueviolet: [138,43,226], brown: [165,42,42], burlywood: [222,184,135], cadetblue: [95,158,160],
  chartreuse: [127,255,0], chocolate: [210,105,30], coral: [255,127,80], cornflowerblue: [100,149,237], cornsilk: [255,248,220],
  crimson: [220,20,60], cyan: [0,255,255], darkblue: [0,0,139], darkcyan: [0,139,139], darkgoldenrod: [184,134,11],
  darkgray: [169,169,169], darkgreen: [0,100,0], darkgrey: [169,169,169], darkkhaki: [189,183,107], darkmagenta: [139,0,139],
  darkolivegreen: [85,107,47], darkorange: [255,140,0], darkorchid: [153,50,204], darkred: [139,0,0], darksalmon: [233,150,122],
  darkseagreen: [143,188,143], darkslateblue: [72,61,139], darkslategray: [47,79,79], darkslategrey: [47,79,79],
  darkturquoise: [0,206,209], darkviolet: [148,0,211], deeppink: [255,20,147], deepskyblue: [0,191,255], dimgray: [105,105,105],
  dimgrey: [105,105,105], dodgerblue: [30,144,255], firebrick: [178,34,34], floralwhite: [255,250,240], forestgreen: [34,139,34],
  fuchsia: [255,0,255], gainsboro: [220,220,220], ghostwhite: [248,248,255], gold: [255,215,0], goldenrod: [218,165,32],
  gray: [128,128,128], green: [0,128,0], greenyellow: [173,255,47], grey: [128,128,128], honeydew: [240,255,240],
  hotpink: [255,105,180], indianred: [205,92,92], indigo: [75,0,130], ivory: [255,255,240], khaki: [240,230,140],
  lavender: [230,230,250], lavenderblush: [255,240,245], lawngreen: [124,252,0], lemonchiffon: [255,250,205],
  lightblue: [173,216,230], lightcoral: [240,128,128], lightcyan: [224,255,255], lightgoldenrodyellow: [250,250,210],
  lightgray: [211,211,211], lightgreen: [144,238,144], lightgrey: [211,211,211], lightpink: [255,182,193],
  lightsalmon: [255,160,122], lightseagreen: [32,178,170], lightskyblue: [135,206,250], lightslategray: [119,136,153],
  lightslategrey: [119,136,153], lightsteelblue: [176,196,222], lightyellow: [255,255,224], lime: [0,255,0],
  limegreen: [50,205,50], linen: [250,240,230], magenta: [255,0,255], maroon: [128,0,0], mediumaquamarine: [102,205,170],
  mediumblue: [0,0,205], mediumorchid: [186,85,211], mediumpurple: [147,112,219], mediumseagreen: [60,179,113],
  mediumslateblue: [123,104,238], mediumspringgreen: [0,250,154], mediumturquoise: [72,209,204], mediumvioletred: [199,21,133],
  midnightblue: [25,25,112], mintcream: [245,255,250], mistyrose: [255,228,225], moccasin: [255,228,181], navajowhite: [255,222,173],
  navy: [0,0,128], oldlace: [253,245,230], olive: [128,128,0], olivedrab: [107,142,35], orange: [255,165,0], orangered: [255,69,0],
  orchid: [218,112,214], palegoldenrod: [238,232,170], palegreen: [152,251,152], paleturquoise: [175,238,238],
  palevioletred: [219,112,147], papayawhip: [255,239,213], peachpuff: [255,218,185], peru: [205,133,63], pink: [255,192,203],
  plum: [221,160,221], powderblue: [176,224,230], purple: [128,0,128], red: [255,0,0], rosybrown: [188,143,143],
  royalblue: [65,105,225], saddlebrown: [139,69,19], salmon: [250,128,114], sandybrown: [244,164,96], seagreen: [46,139,87],
  seashell: [255,245,238], sienna: [160,82,45], silver: [192,192,192], skyblue: [135,206,235], slateblue: [106,90,205],
  slategray: [112,128,144], slategrey: [112,128,144], snow: [255,250,250], springgreen: [0,255,127], steelblue: [70,130,180],
  tan: [210,180,140], teal: [0,128,128], thistle: [216,191,216], tomato: [255,99,71], turquoise: [64,224,208], violet: [238,130,238],
  wheat: [245,222,179], white: [255,255,255], whitesmoke: [245,245,245], yellow: [255,255,0], yellowgreen: [154,205,50] };

  // X11/W3C Color Name check
  var predefinedColor = colorKeywords[ color.toLowerCase() ];
  if( predefinedColor ) {
    return "#" + DectoHex(predefinedColor[0]) + DectoHex(predefinedColor[1]) + DectoHex(predefinedColor[2]);
  }

  // Hex color patterns
  var hexColorTypes = {
    "hexLong": /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    "hexShort": /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
  };

  for(var colorType in hexColorTypes) {
    if(color.match(hexColorTypes[ colorType ]))
      return color;
  }

  // Other color patterns
  var otherColorTypes = [
    ["rgb", /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/],
    ["rgb", /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+(?:\.\d+)?|\.\d+)\s*\)$/], // rgba
    ["hsl", /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/],
    ["hsl", /^hsla\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%,\s*(\d+(?:\.\d+)?|\.\d+)\s*\)$/], // hsla
    ["hsv", /^hsv\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/]
  ];

  function hueToRgb( p, q, t ) {
    if ( t < 0 ) {
      t += 1;
    }
    if ( t > 1 ) {
      t -= 1;
    }
    if ( t < 1 / 6 ) {
      return p + ( q - p ) * 6 * t;
    }
    if ( t < 1 / 2 ) {
      return q;
    }
    if ( t < 2 / 3 ) {
      return p + ( q - p ) * ( 2 / 3 - t ) * 6;
    }
    return p;
  };

  var toRGB = {
    rgb: function( bits ) {
      return [ bits[1], bits[2], bits[3], bits[4] || 1 ];
    },
    hsl: function( bits ) {
      var hsl = {
        h : ( parseInt( bits[ 1 ], 10 ) % 360 ) / 360,
        s : ( parseInt( bits[ 2 ], 10 ) % 101 ) / 100,
        l : ( parseInt( bits[ 3 ], 10 ) % 101 ) / 100,
        a : bits[4] || 1
      };

      if ( hsl.s === 0 )
        return [ hsl.l, hsl.l, hsl.l ];

      var q = hsl.l < 0.5 ? hsl.l * ( 1 + hsl.s ) : hsl.l + hsl.s - hsl.l * hsl.s;
      var p = 2 * hsl.l - q;

      return [
        ( hueToRgb( p, q, hsl.h + 1 / 3 ) * 256 ).toFixed( 0 ),
        ( hueToRgb( p, q, hsl.h ) * 256 ).toFixed( 0 ),
        ( hueToRgb( p, q, hsl.h - 1 / 3 ) * 256 ).toFixed( 0 ),
        hsl.a
      ];
    },
    hsv: function( bits ) {
      var rgb = {},
          hsv = {
            h : ( parseInt( bits[ 1 ], 10 ) % 360 ) / 360,
            s : ( parseInt( bits[ 2 ], 10 ) % 101 ) / 100,
            v : ( parseInt( bits[ 3 ], 10 ) % 101 ) / 100
          },
          i = Math.floor( hsv.h * 6 ),
          f = hsv.h * 6 - i,
          p = hsv.v * ( 1 - hsv.s ),
          q = hsv.v * ( 1 - f * hsv.s ),
          t = hsv.v * ( 1 - ( 1 - f ) * hsv.s );

      switch( i % 6 ) {
        case 0:
          rgb.r = hsv.v; rgb.g = t; rgb.b = p;
          break;
        case 1:
          rgb.r = q; rgb.g = hsv.v; rgb.b = p;
          break;
        case 2:
          rgb.r = p; rgb.g = hsv.v; rgb.b = t;
          break;
        case 3:
          rgb.r = p; rgb.g = q; rgb.b = hsv.v;
          break;
        case 4:
          rgb.r = t; rgb.g = p; rgb.b = hsv.v;
          break;
        case 5:
          rgb.r = hsv.v; rgb.g = p; rgb.b = q;
          break;
      }

      return [ rgb.r * 256,  rgb.g * 256, rgb.b * 256 ];
    }
  };

  function DectoHex( dec ) {
    var hex = parseInt( dec, 10 );
    hex = hex.toString(16);
    return hex == 0 ? "00" : hex;
  }

  function applySaturation( rgb ) {
    var alpha = parseFloat(rgb[3] || 1);
    if((alpha + "") === "NaN" || alpha < 0 || alpha >= 1) return rgb;
    if(alpha == 0) {
      return [ 255, 255, 255 ];
    }
    return [
      alpha * parseInt(rgb[0], 10) + (1 - alpha) * (backgroundColorVal || 255),
      alpha * parseInt(rgb[1], 10) + (1 - alpha) * (backgroundColorVal || 255),
      alpha * parseInt(rgb[2], 10) + (1 - alpha) * (backgroundColorVal || 255)
    ]; // assumes background is white (255)
  }

  for(var i = 0, l = otherColorTypes.length; i < l; i++) {
    var bits = otherColorTypes[i][1].exec( color );
    if(bits) {
      var rgbVal = applySaturation( toRGB[ otherColorTypes[i][0] ]( bits ) );
      return "#" + DectoHex(rgbVal[0] || 255) + DectoHex(rgbVal[1] || 255) + DectoHex(rgbVal[2] || 255);
    }
  }

  return "#f00"; // default in case of error

};
