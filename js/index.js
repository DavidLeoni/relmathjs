var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    if (x || typeof x === "number" || typeof x === "string" || typeof x === "boolean") {
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
 * Checks provided array or string is not empty
 */
var checkNotEmpty = function (obj, msg) {
    checkNotNull(obj);
    if (typeof obj === "string" || Array.isArray(obj)) {
        if (obj.length > 0) {
            return obj;
        }
        else {
            var newMsg = msg ? msg : "Provided parameter is not empty! :" + obj;
            throw new Error(newMsg);
        }
    }
    else {
        throw new Error("Provided param is not an Array nor a string! " + obj);
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
    /**
     * Note we currently need to manually add the 'this' as strangely
     * enough Typescript doesn't infer the type.
    */
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
        if (fontSize === void 0) { fontSize = 20; }
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
 *  Logical coords are in pixels.
 * <strong> Note </strong> in SVG coords start from upper left corner
 * and height goes downward, but we're more old-school:
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
 * The bridge between logical view and physical view determined by the id
 */
var Shape = (function () {
    function Shape(id, centre) {
        if (id === void 0) { id = "relmath-default-id"; }
        if (centre === void 0) { centre = Point.of(); }
        this.id = id;
        this.centre = centre;
        // this.check(); nope, will call the inherited ones...
    }
    Shape.prototype.check = function () {
        checkNotEmpty(this.id);
        checkNotNull(this.centre);
        return this;
    };
    Shape.of = function (properties) {
        return of(Shape.DEFAULT, properties);
    };
    Shape.prototype.with = function (properties) {
        return wither(properties, this);
    };
    Shape.prototype.draw = function (display) {
        // check already existing
        // if so delete and warn ?        
        console.log("Empty shape, drawing nothing to display ", display);
    };
    Shape.DEFAULT = new Shape();
    return Shape;
})();
/**
 * The logical representation of a Relation.
 *
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
        checkArgument(this.mappings.length === this.domain.length, "Relation mappings should have "
            + this.domain.length + " rows, "
            + " but has instead length " + this.mappings.length);
        this.mappings.forEach(function (arr, i) {
            checkArgument(_this.mappings[i].length === _this.codomain.length, "Relation mapping row at " + i + " has length "
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
        var rectDomain = rect.with({ centre: rect.centre.with({ x: rect.centre.x - rect.width / 3 }),
            width: rect.width / 2 });
        var styleDomain = style.with({
            backgroundColor: "#fc9",
            color: "#000",
            borderColor: "#000"
        });
        var domainShapes = this.drawDomain(display, this.domain, rectDomain, styleDomain);
        var styleCodomain = styleDomain.with({
            backgroundColor: "#9cf"
        });
        var rectCodomain = rect.with({
            width: rect.width / 2,
            centre: rect.centre.with({
                x: rect.centre.x + (rect.width / 3)
            })
        });
        var codomainShapes = this.drawDomain(display, this.codomain, rectCodomain, styleCodomain);
        this.drawMappings(display, domainShapes, codomainShapes, style);
    };
    Relation.prototype.drawMappings = function (display, domainShapes, codomainShapes, style) {
        for (var d = 0; d < this.domain.length; d++) {
            for (var cd = 0; cd < this.codomain.length; cd++) {
                if (this.mappings[d][cd]) {
                    display.connect(domainShapes[d], codomainShapes[cd]);
                }
            }
        }
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
     * Draws domain within given rect. Returns the shapes of the created circles.
     */
    Relation.prototype.drawDomain = function (display, domain, rect, style) {
        checkNotNull(domain);
        checkNotNull(rect);
        if (domain.length === 0) {
            return;
        }
        var ret = [];
        var centres = Relation.getCircleCentres(domain.length, rect);
        var parentShape = display.drawShape(Shape.of());
        for (var domi = 0; domi < domain.length; domi++) {
            ret.push(display.drawCircle(centres[domi], DEFAULT_RADIUS, parentShape, style));
            display.drawText(toText(domain[domi]), centres[domi], style);
        }
        return ret;
    };
    /**
     * Returns the centres of the circles to be displayed in a given domain/codomain region
     * @param n The dimension of the domain/codomain
     * @param rect the region where the domain/codomain will be represented
     *
     */
    Relation.getCircleCentres = function (n, rect) {
        var ret = [];
        var dy = rect.height / (n + 1);
        var x = rect.centre.x;
        for (var domi = 0; domi < n; domi++) {
            var y = rect.centre.y + rect.height / 2 - (domi + 1) * dy;
            var center = new Point(x, y);
            ret.push(center);
        }
        return ret;
    };
    Relation.DEFAULT = new Relation();
    return Relation;
})();
var CircleShape = (function (_super) {
    __extends(CircleShape, _super);
    function CircleShape(radius, text) {
        if (radius === void 0) { radius = 4; }
        if (text === void 0) { text = '☺'; }
        _super.call(this);
        this.radius = radius;
        this.text = text;
        console.log("this.radius 1 = ", this.radius);
        this.check();
    }
    CircleShape.prototype.check = function () {
        console.log("this.radius 2 = ", this.radius);
        _super.prototype.check.call(this);
        console.log("this.radius 3 = ", this.radius);
        checkNotNull(this.radius);
        checkNotEmpty(this.text);
        return this;
    };
    CircleShape.of = function (properties) {
        return of(CircleShape.DEFAULT, properties);
    };
    CircleShape.prototype.with = function (properties) {
        return wither(properties, this);
    };
    CircleShape.prototype.draw = function (display) {
        throw new Error("TODO implement me!");
    };
    CircleShape.DEFAULT = new CircleShape();
    return CircleShape;
})(Shape);
/**
 *  A logical rectangle, with coords expressed in pixels (see {@link Point} )
 */
var Rect = (function () {
    function Rect(centre, width, height) {
        if (centre === void 0) { centre = Point.of(); }
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        this.centre = centre;
        this.width = width;
        this.height = height;
        this.check();
    }
    Rect.prototype.check = function () {
        checkNotNull(this.centre);
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
        this.rect = new Rect(Point.of(), width, height);
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
    Display.prototype.xToViewport = function (x) {
        return x + this.rect.width / 2;
    };
    Display.prototype.yToViewport = function (y) {
        return (this.rect.height / 2) - y;
    };
    Display.prototype.drawShape = function (shape) {
        var g = this.draw.group();
        return Shape.of({ id: g.attr('id') });
    };
    /**
     * Draws a line between two elements
    */
    Display.prototype.connect = function (shape1, shape2) {
        checkNotNull(shape1);
        checkNotNull(shape2);
        var el1 = SVG.get(shape1.id);
        var el2 = SVG.get(shape2.id);
        var links = this.draw.group();
        var markers = this.draw.group();
        el1.connectable({
            container: links,
            markers: markers,
            padEllipse: true
        }, el2).setLineColor("#5D4037");
    };
    Display.prototype.drawLine = function (a, b, style) {
        if (style === void 0) { style = Style.of(); }
        this.draw.line(this.xToViewport(a.x), this.yToViewport(a.y), this.xToViewport(b.x), this.yToViewport(b.y))
            .stroke(style.color);
    };
    /**
     * @param parentShape MUST BE A GROUP!
    */
    Display.prototype.drawCircle = function (centre, radius, parentShape, style) {
        if (style === void 0) { style = Style.of(); }
        checkNotNull(centre);
        checkNotNull(radius);
        checkNotNull(parentShape);
        var nodes = SVG.get(parentShape.id);
        var g = nodes.group()
            .move(this.xToViewport(centre.x - (radius / 2)), this.yToViewport(centre.y + (radius / 2)));
        g.circle(radius)
            .fill(style.backgroundColor)
            .stroke(style.borderColor);
        return Shape.of({ id: g.attr("id"), centre: centre });
    };
    Display.prototype.drawRect = function (rect, style) {
        if (style === void 0) { style = Style.of(); }
        checkNotNull(rect);
        this.draw.rect(rect.width, rect.height)
            .move(this.xToViewport(rect.centre.x - (rect.width / 2)), this.yToViewport(rect.centre.y) - rect.height / 2)
            .fill(style.backgroundColor);
    };
    return Display;
})();
var debug;
(function (debug) {
    debug.drawCenteredRect = function (display) {
        display.drawRect(Rect.of({
            centre: Point.of(),
            width: 30,
            height: 100 }));
    };
    debug.drawCoords = function (display) {
        var sectors = 6;
        var dx = display.rect.width / sectors;
        var dy = display.rect.height / sectors;
        for (var xi = 0; xi < sectors; xi++) {
            for (var yi = 0; yi < sectors; yi++) {
                var x = xi * dx;
                var y = yi * dy;
                var t = display.draw
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
})(debug || (debug = {}));
var beliefs = ['☮', '☯', '☭'];
var stars = ['★', '✩'];
var hands = ['☜', '☝', '☞', '☟'];
var dangers = ['☢', '☣', '⚡', '☠'];
var smilies = ['☺', '☹'];
var weather3 = ['☼', '☁', '☂'];
var weather4 = ['☼', '☁', '☂', '❄'];
var rel = Relation.of({
    domain: weather3,
    codomain: smilies,
    mappings: [[true, true],
        [false, false],
        [false, true]]
});
window.addEventListener("load", function () {
    var display = new Display(300, 300);
    var relStyle = Style.DEFAULT.with({ backgroundColor: "#00f" });
    //display.drawCircle(new Point(0,0), 30, Style.builder().backgroundColor("#f00").build());
    var relRect = new Rect(display.rect.centre, display.rect.width / 1.5, display.rect.height / 1.5);
    rel.draw(display, relRect, relStyle);
    // debug.drawCenteredRect(display);
    // debug.drawCoords(display);
});
//# sourceMappingURL=index.js.map