var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var StyleBuilder = (function () {
    function StyleBuilder(style) {
        if (style) {
            this.style = clone(style);
        }
        else {
            this.style = new Style();
        }
        this.built = false;
    }
    StyleBuilder.prototype.checkAlreadyBuilt = function () {
        if (this.built) {
            throw new Error("Builder already built an object!");
        }
    };
    StyleBuilder.prototype.color = function (color) {
        this.checkAlreadyBuilt();
        checkColor(color);
        this.style.color = color;
        return this;
    };
    StyleBuilder.prototype.backgroundColor = function (backgroundColor) {
        this.checkAlreadyBuilt();
        checkColor(backgroundColor);
        this.style.backgroundColor = backgroundColor;
        return this;
    };
    StyleBuilder.prototype.borderColor = function (borderColor) {
        this.checkAlreadyBuilt();
        checkColor(borderColor);
        this.style.borderColor = borderColor;
        return this;
    };
    StyleBuilder.prototype.fontSize = function (fontSize) {
        this.checkAlreadyBuilt();
        checkNotNull(fontSize);
        this.style.fontSize = fontSize;
        return this;
    };
    StyleBuilder.prototype.build = function () {
        this.checkAlreadyBuilt();
        this.built = true;
        return this.style;
    };
    return StyleBuilder;
})();
var Style = (function () {
    function Style() {
        this.color = "#000";
        this.backgroundColor = "#fff";
        this.borderColor = "#000";
        this.fontSize = 10;
    }
    Style.builder = function (style) {
        return new StyleBuilder(style);
    };
    Style.of = function () {
        return Style.DEFAULT;
    };
    Style.DEFAULT = new Style();
    return Style;
})();
var DEBUG_STYLE = Style.builder(Style.of())
    .backgroundColor("#ecc")
    .color("#f00")
    .borderColor("#f00")
    .build();
/*
interface P {
    a?:string;
    b?:number;
}
*/
var Immutable = (function () {
    function Immutable() {
    }
    Immutable.prototype.check = function () {
        return this;
    };
    Immutable.prototype.with = function (p) {
        var ret = clone(this);
        for (var _i = 0, _a = Object.keys(p); _i < _a.length; _i++) {
            var key = _a[_i];
            ret[key] = p[key];
        }
        return ret.check();
    };
    return Immutable;
})();
var MyClass = (function (_super) {
    __extends(MyClass, _super);
    function MyClass() {
        _super.apply(this, arguments);
    }
    MyClass.prototype.check = function () {
        return this;
    };
    MyClass.prototype.f = function () {
        var y = Math.pow(2, 4);
        //return this.check();
        return this.with({ v: 3 });
    };
    return MyClass;
})(Immutable);
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
        checkNotNull(domain);
        checkNotNull(codomain);
        checkNotNull(mappings);
        checkArgument(mappings.length === domain.length, "Mappings should have " + domain.length + " rows, "
            + " but has instead length " + mappings.length);
        mappings.forEach(function (arr, i) {
            checkArgument(mappings[i].length === codomain.length, "Mappings row at " + i + " has length "
                + mappings[i].length + " but should have length " + codomain.length);
        });
        this.domain = domain;
        this.codomain = codomain;
        this.mappings = mappings;
    }
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
        checkNotNull(x);
        checkNotNull(y);
        this.x = x;
        this.y = y;
    }
    return Point;
})();
/**
 *  Coords in pixels, see {@link Point}
 */
var Rect = (function () {
    function Rect(origin, width, height) {
        checkNotNull(origin);
        checkNotNull(width);
        checkNotNull(height);
        this.origin = origin;
        this.width = width;
        this.height = height;
    }
    return Rect;
})();
/**
 * Everybody needs cloning, see http://stackoverflow.com/a/24648941
 */
function clone(o) {
    var gdcc = "__getDeepCircularCopy__";
    if (o !== Object(o)) {
        return o; // primitive value
    }
    var set = gdcc in o, cache = o[gdcc], result;
    if (set && typeof cache == "function") {
        return cache();
    }
    // else
    o[gdcc] = function () { return result; }; // overwrite
    if (o instanceof Array) {
        result = [];
        for (var i = 0; i < o.length; i++) {
            result[i] = clone(o[i]);
        }
    }
    else {
        result = {};
        for (var prop in o)
            if (prop != gdcc)
                result[prop] = clone(o[prop]);
            else if (set)
                result[prop] = clone(cache);
    }
    if (set) {
        o[gdcc] = cache; // reset
    }
    else {
        delete o[gdcc]; // unset again
    }
    return result;
}
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
var relStyle = Style.builder()
    .backgroundColor("#00f")
    .build();
//display.drawCircle(new Point(0,0), 30, Style.builder().backgroundColor("#f00").build());
var relRect = new Rect(new Point(0, 0), display.rect.width / 3, display.rect.height / 3);
rel.draw(display, relRect, relStyle);
//# sourceMappingURL=index.js.map