/**
 * Deep copy an object (make copies of all its object properties, sub-properties, etc.)
 * An improved version of http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
 * that doesn't break if the constructor has required parameters
 *
 * It also borrows some code from http://stackoverflow.com/a/11621004/560114
 *
 * (dav: solution copied from here: http://stackoverflow.com/a/13333781)
 */
function deepClone(src, /* INTERNAL */ _visited) {
    if (src == null || typeof (src) !== 'object') {
        return src;
    }
    // Initialize the visited objects array if needed
    // This is used to detect cyclic references
    if (_visited == undefined) {
        _visited = [];
    }
    else {
        var i, len = _visited.length;
        for (i = 0; i < len; i++) {
            // If src was already visited, don't try to copy it, just return the reference
            if (src === _visited[i]) {
                return src;
            }
        }
    }
    // Add this object to the visited array
    _visited.push(src);
    //Honor native/custom clone methods
    if (typeof src.clone == 'function') {
        return src.clone(true);
    }
    //Special cases:
    //Array
    if (Object.prototype.toString.call(src) == '[object Array]') {
        //[].slice(0) would soft clone
        ret = src.slice();
        var i = ret.length;
        while (i--) {
            ret[i] = deepClone(ret[i], _visited);
        }
        return ret;
    }
    //Date
    if (src instanceof Date) {
        return new Date(src.getTime());
    }
    //RegExp
    if (src instanceof RegExp) {
        return new RegExp(src);
    }
    //DOM Elements
    if (src.nodeType && typeof src.cloneNode == 'function') {
        return src.cloneNode(true);
    }
    //If we've reached here, we have a regular object, array, or function
    //make sure the returned object has the same prototype as the original
    var proto = (Object.getPrototypeOf ? Object.getPrototypeOf(src) : src.__proto__);
    if (!proto) {
        proto = src.constructor.prototype; //this line would probably only be reached by very old browsers 
    }
    var ret = Object.create(proto);
    for (var key in src) {
        //Note: this does NOT preserve ES5 property attributes like 'writable', 'enumerable', etc.
        //For an example of how this could be modified to do so, see the singleMixin() function
        ret[key] = deepClone(src[key], _visited);
    }
    return ret;
}
var SVG;
var checkNotNull = function (x, msg) {
    if (x || typeof x === "number" || typeof x === "string") {
        return x;
    }
    else {
        var newMsg = msg ? msg : "Found null/undefined value: ";
        throw new Error(newMsg + x);
    }
};
var checkArgument = function (x, msg) {
    checkNotNull(x);
    if (x) {
        return x;
    }
    else {
        var newMsg = msg ? msg : "Found false argument!";
        throw new Error(newMsg);
    }
};
/**
 * Checks plain javascript equality with ===
 */
var checkEquals = function (x, y, msg) {
    if (x === y) {
        return x;
    }
    else {
        var newMsg = msg ? msg : "x !== y ! x was :" + x + " and y was: " + y;
        throw new Error(newMsg);
    }
};
/**
 * Checks provided array is not empty
 */
var checkNotEmpty = function (arr, msg) {
    checkNotNull(arr);
    checkArgument(Array.isArray(arr), "PRovided param is not an Array!");
    if (arr.length > 0) {
        return arr;
    }
    else {
        var newMsg = msg ? msg : "Provided parameter is not an array! :" + arr;
        throw new Error(newMsg);
    }
};
/**
 * Returns a new shallow copy of obj merging inside it the provided fields.
 */
var wither = function (properties, obj) {
    checkNotNull(properties);
    if (Object.keys(properties).length === 0) {
        return obj;
    }
    else {
        var ret = deepClone(obj); // todo should be shallow ...
        for (var _i = 0, _a = Object.keys(properties); _i < _a.length; _i++) {
            var key = _a[_i];
            ret[key] = properties[key];
        }
        return ret.check();
    }
};
/**
 *
 */
function of(empty, properties) {
    if (properties) {
        return empty.with(properties);
    }
    else {
        return empty;
    }
}
/**
 * Example of immutable class.
 */
var MyImm = (function () {
    /** Avoid calling this directly, use {@link of} method instead.
     * (Constructor can't be private in Typescript)
     */
    function MyImm(_x, y) {
        if (_x === void 0) { _x = "a"; }
        if (y === void 0) { y = 3; }
        this._x = _x;
        this.y = y;
        this.check();
    }
    Object.defineProperty(MyImm.prototype, "x", {
        /**
         * Shows we can have a get property if we want to
         */
        get: function () {
            return this._x;
        },
        enumerable: true,
        configurable: true
    });
    MyImm.prototype.check = function () {
        checkArgument(this.y > 2);
        return this;
    };
    MyImm.of = function (properties) {
        return of(MyImm.DEFAULT, properties);
    };
    MyImm.prototype.with = function (properties) {
        return wither(properties, this);
    };
    MyImm.prototype.trial = function () {
        //return this.check();
        return this.with({ x: "a" });
    };
    ;
    MyImm.DEFAULT = new MyImm();
    return MyImm;
})();
console.log("My immutable class = ", MyImm.of({ y: 3 }).with({ x: "3" }));
var DEFAULT_RADIUS = 30;
var toText = function (obj) {
    if (typeof obj === "string"
        || typeof obj === "number"
        || typeof obj === "date") {
        return obj.toString();
    }
    else {
        return JSON.stringify(obj);
    }
};
/**
 * Admits only 3 letter lowercase color strings like #3fc
 */
var checkColor = function (colorString) {
    checkNotNull(colorString);
    checkEquals(colorString.length, 4);
    checkEquals(colorString.charAt(0), '#');
    for (var i = 1; i < colorString.length; i++) {
        var c = colorString.charAt(i);
        if (isNaN(+c) && c === c.toUpperCase()) {
            throw new Error("We admit only lowercase characters in color strings! Found instead: '" + c + "' in " + colorString);
        }
    }
};
var Style = (function () {
    function Style(color, backgroundColor, borderColor, fontSize) {
        if (color === void 0) { color = "#000"; }
        if (backgroundColor === void 0) { backgroundColor = "#fff"; }
        if (borderColor === void 0) { borderColor = "#000"; }
        if (fontSize === void 0) { fontSize = 10; }
        this.color = color;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.fontSize = fontSize;
        this.check();
    }
    Style.prototype.check = function () {
        checkColor(this.color);
        checkColor(this.backgroundColor);
        checkColor(this.borderColor);
        checkArgument(this.fontSize && this.fontSize > 0);
        return this;
    };
    Style.of = function (properties) {
        return of(Style.DEFAULT, properties);
    };
    Style.prototype.with = function (properties) {
        return wither(properties, this);
    };
    Style.DEFAULT = new Style();
    return Style;
})();
var DEBUG_STYLE = Style.DEFAULT.with({
    backgroundColor: "#ecc",
    color: "#f00",
    borderColor: "#f00",
});
/**
 * <pre>
 *
 *   0 1 2
 * 0 .
 * 1 .
 * 2   .
 * 3 . .
 *
 * </pre>
 */
var Relation = (function () {
    function Relation(domain, codomain, mappings) {
        if (domain === void 0) { domain = []; }
        if (codomain === void 0) { codomain = []; }
        if (mappings === void 0) { mappings = []; }
        this.domain = domain;
        this.codomain = codomain;
        this.mappings = mappings;
        this.check();
    }
    Relation.prototype.check = function () {
        var _this = this;
        checkNotNull(this.domain);
        checkNotNull(this.codomain);
        checkNotNull(this.mappings);
        checkArgument(this.mappings.length === this.domain.length, "Mappings should have "
            + this.domain.length + " rows, "
            + " but has instead length " + this.mappings.length);
        this.mappings.forEach(function (arr, i) {
            checkArgument(_this.mappings[i].length === _this.codomain.length, "Mappings row at " + i + " has length "
                + _this.mappings[i].length + " but should have length " + _this.codomain.length);
        });
        return this;
    };
    Relation.of = function (properties) {
        return of(Relation.DEFAULT, properties);
    };
    Relation.prototype.with = function (properties) {
        return wither(properties, this);
    };
    Relation.prototype.draw = function (display, rect, style) {
        display.drawRect(rect, DEBUG_STYLE);
        this.drawDomain(display, this.domain, rect, style);
    };
    /**
     * <pre>
     * -------
     * |     |
     * |- a -|
     * |     |
     * |- b -|
     * |     |
     * -------
     * </pre>
     *
     *
     * Draws domain within given rect
     */
    Relation.prototype.drawDomain = function (display, domain, rect, style) {
        checkNotNull(domain);
        checkNotNull(rect);
        if (domain.length === 0) {
            return;
        }
        var dy = rect.height / (domain.length + 1);
        var x = rect.origin.x + (rect.width / 2);
        for (var _i = 0; _i < domain.length; _i++) {
            var d = domain[_i];
            for (var iy = 0; iy < domain.length; iy++) {
                var y = rect.origin.y + rect.height - (iy + 1) * dy;
                var center = new Point(x, y);
                display.drawCircle(center, DEFAULT_RADIUS, style);
                display.drawText(toText(d), center, style);
            }
        }
    };
    Relation.DEFAULT = new Relation();
    return Relation;
})();
/**
 *  Coords in pixels
 *
 * <pre>
 *  -1, 1   0, 1	1, 1
 *  -1, 0   0, 0    1, 0
 *  -1,-1   0,-1	1,-1
 *
 * </pre>
 *
 */
var Point = (function () {
    function Point(x, y) {
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        this.x = x;
        this.y = y;
        this.check();
    }
    Point.prototype.check = function () {
        checkNotNull(this.x);
        checkNotNull(this.y);
        return this;
    };
    Point.of = function (properties) {
        return of(Point.DEFAULT, properties);
    };
    Point.prototype.with = function (properties) {
        return wither(properties, this);
    };
    Point.DEFAULT = new Point();
    return Point;
})();
/**
 *  Coords in pixels, see {@link Point}
 */
var Rect = (function () {
    function Rect(origin, width, height) {
        if (origin === void 0) { origin = Point.of(); }
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        this.origin = origin;
        this.width = width;
        this.height = height;
        this.check();
    }
    Rect.prototype.check = function () {
        checkNotNull(this.origin);
        checkNotNull(this.width);
        checkNotNull(this.height);
        return this;
    };
    Rect.of = function (properties) {
        return of(Rect.DEFAULT, properties);
    };
    Rect.prototype.with = function (properties) {
        return wither(properties, this);
    };
    Rect.DEFAULT = new Rect();
    return Rect;
})();
var Display = (function () {
    function Display(width, height) {
        // create svg drawing
        checkArgument(width > 0);
        checkArgument(height > 0);
        this.rect = new Rect(new Point(-width / 2, -height / 2), width, height);
        var mySVG = document.getElementById("drawing");
        mySVG.style.width = this.rect.width.toString() + "px";
        mySVG.style.height = this.rect.height.toString() + "px";
        this.draw = SVG('drawing');
        /*
        this.draw.rect(this.width, this.height)
            .move(0, 0)
            .fill('#ddd')
        */
        //this.drawRect(new Rect(new Point(0,0), 50, 200));
        /*
                this.draw
                    .rect(150, 50)
                    .move(100, 100)
                    .fill('#f09')
        */
        // create image
        // var image = draw.image('images/shade.jpg')
        // image.size(650, 650).y(-150)
        // this.drawCoords();
        /*
        // create text
        var text = this.draw.text('some TEXT').move(300, 0)
        text.font({
            family: 'Source Sans Pro'
            , size: 100
            , anchor: 'middle'
            , leading: 1
        })
        */
        // clip image with text
        //image.clipWith(text)
    }
    /**
    * TODO: automatically handly newlines
    */
    Display.prototype.drawText = function (text, center, style) {
        if (style === void 0) { style = Style.of(); }
        checkNotNull(text);
        var approxTextWidth = text.length * style.fontSize * 0.1;
        var t = this.draw
            .text(text)
            .move(this.xToViewport(center.x) - (approxTextWidth / 2), this.yToViewport(center.y) - (style.fontSize / 2))
            .fill(style.color)
            .font({
            family: 'Source Sans Pro',
            size: style.fontSize,
            anchor: 'middle',
            leading: 1
        });
    };
    Display.prototype.drawCoords = function () {
        var sectors = 6;
        var dx = this.rect.width / sectors;
        var dy = this.rect.height / sectors;
        for (var xi = 0; xi < sectors; xi++) {
            for (var yi = 0; yi < sectors; yi++) {
                var x = xi * dx;
                var y = yi * dy;
                var t = this.draw
                    .text(x.toFixed(0) + ',' + y.toFixed(0))
                    .move(x, y);
                t.font({
                    family: 'Source Sans Pro',
                    size: 10,
                    anchor: 'middle',
                    leading: 1
                });
            }
        }
    };
    Display.prototype.xToViewport = function (x) {
        return x + this.rect.width / 2;
    };
    Display.prototype.yToViewport = function (y) {
        return (this.rect.height / 2) - y;
    };
    Display.prototype.drawLine = function (a, b) {
    };
    Display.prototype.drawCircle = function (centre, radius, style) {
        if (style === void 0) { style = Style.of(); }
        checkNotNull(centre);
        checkNotNull(radius);
        this.draw.circle(radius)
            .move(this.xToViewport(centre.x - (radius / 2)), this.yToViewport(centre.y + (radius / 2)))
            .fill(style.backgroundColor);
    };
    Display.prototype.drawRect = function (rect, style) {
        if (style === void 0) { style = Style.of(); }
        checkNotNull(rect);
        this.draw.rect(rect.width, rect.height)
            .move(this.xToViewport(rect.origin.x), this.yToViewport(rect.origin.y) - rect.height)
            .fill(style.backgroundColor);
    };
    return Display;
})();
var rel = new Relation(["a", "b"], [1, 2], [[true, false], [false, false]]);
var display = new Display(300, 300);
console.log("r = ", rel);
var relStyle = Style.DEFAULT.with({ backgroundColor: "#00f" });
//display.drawCircle(new Point(0,0), 30, Style.builder().backgroundColor("#f00").build());
var relRect = new Rect(new Point(0, 0), display.rect.width / 3, display.rect.height / 3);
rel.draw(display, relRect, relStyle);
//# sourceMappingURL=index.js.map