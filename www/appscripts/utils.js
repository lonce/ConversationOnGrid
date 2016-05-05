define(
    [],
        function(){
            var utils = {};
    		// utilities
		    // Until requestAnimationFrame comes standard in all browsers, test
            // for the prefixed names as well.

            utils.getRequestAnimationFrameFunc = function() {
                try {
                    return (window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.msRequestAnimationFrame ||
                            (function (cb) {
                                setTimeout(cb, 1000/60);
                            }));
                } catch (e) {
                    return undefined;
                }
            };

           function byte2Hex(n)
            {
                var nybHexString = "0123456789ABCDEF";
                return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
            }

            /**
             * Converts an HSL color value to RGB. Conversion formula
             * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
             * Assumes h, s, and l are contained in the set [0, 1] and
             * returns r, g, and b in the set [0, 255].
             *
             * @param   Number  h       The hue
             * @param   Number  s       The saturation
             * @param   Number  l       The lightness
             * @return  Array           The RGB representation
             */
            utils.hslToRgb=function(h, s, l){
                var r, g, b;

                if(s == 0){
                    r = g = b = l; // achromatic
                }else{
                    function hue2rgb(p, q, t){
                        if(t < 0) t += 1;
                        if(t > 1) t -= 1;
                        if(t < 1/6) return p + (q - p) * 6 * t;
                        if(t < 1/2) return q;
                        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                        return p;
                    }

                    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    var p = 2 * l - q;
                    r = hue2rgb(p, q, h + 1/3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1/3);
                }

                return '#' + byte2Hex(Math.floor(r * 255)) + byte2Hex(Math.floor(g * 255)) + byte2Hex(Math.floor(b * 255));
                //return [r * 255, g * 255, b * 255];
            }

            // converts two arrays representing x and y values into an SVG string for drawing lines
            utils.atopstring = function(a, b){
                s="M " + a[0] + " " + b[0] + " L";
                for(i=1;i<a.length;i++){
                    s+= " " + a[i] + " " + b[i];
                }
                return s;
            }

                        Array.prototype.scale = function (sc) {
                var newa=[];
                for (var i = 0; i < this.length; i++) {
                    newa[i]=this[i]*sc;
                }
                return newa;
            };
            Array.prototype.translate = function (tr) {
                var newa=[];
                for (var i = 0; i < this.length; i++) {
                    newa[i]=this[i]+tr;
                }
                return newa;
            };

            Array.prototype.last = function () {
                return this[this.length - 1];
            };

            Array.prototype.fill = function (l,v) {
                var first=this.length;
                for(var i=first;i<l;i++){
                    this[i]=v || i;
                }
                return this;
            }


            return utils;
});
