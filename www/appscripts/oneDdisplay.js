define(
    ["utils", "../jslibs/raphael-min"],
    function(utils){
        return function(div){
            var paper; // This function will return a Raphael paper

            svgElmt = document.getElementById(div);
            var wpWidth = svgElmt.width.baseVal.value;
        	var wpHeight = svgElmt.height.baseVal.value;
        	var paper=Raphael(document.getElementById("footerdiv"), wpWidth, wpHeight);


			var scaleSlider = document.getElementById("scaleSliderID");
            scaleSlider.addEventListener("input", function(){
            	scaleVal=wpHeight/scaleSlider.value;
        	});

        	var transSlider = document.getElementById("transSliderID");
            transSlider.addEventListener("input", function(){
            	transVal=transSlider.value;
        	});

        	var scaleVal = (scaleSlider && wpHeight/scaleSlider.value) ||  wpHeight/150;
        	var transVal = (transSlider && transSlider.value) || -275;

        	paper.plot=function(indexArray, valArray, color){
        		//console.log("scaleVal = " + scaleVal + ", and transVal = " + transVal);
        		pathString = utils.atopstring(indexArray,valArray.scale(scaleVal).translate(Math.round(transVal)));
                convTracePaper.path(pathString).attr({"stroke": color});
        	}
            return paper;

        }
    }
)