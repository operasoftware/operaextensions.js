
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
  if(!color) {
    return undefined;
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
