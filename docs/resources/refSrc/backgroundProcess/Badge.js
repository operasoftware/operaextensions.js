/**
* The text that will be shown in the badge. This may overflow the visual space provided, which is usually around 4  characters.
* @type DOMString
**/
Badge.prototype.textContent = "";

/**
* The background color for the badge. Accepts hexadecimal notation, RGBA and color name values (e.g., #afafaf, (200, 200, 200, 0), blue)
* @type DOMString
**/
Badge.prototype.backgroundColor = "";

/**
* The color of the text of the badge. Accepts hexadecimal notation, RGBA and color name values (e.g., #afafaf, (200, 200, 200, 0), blue)
* @type DOMString
**/
Badge.prototype.color = "";

/**
* If the badge should be displayed. Allowed values: <code>block</code> and <code>none</code>. Set to <code>none</code> by default.
* @type DOMString
**/
Badge.prototype.display = "none";