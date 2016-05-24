/* This application does simple "event chat". Here, events are mouse clicks on a canvas. 
	We register for the following messages:
		init - sent by the server after the client connects. Data returned is an id that the server and other clients will use to recognizes messages from this client.
		mouseClick - sent when another chatroom member generates a mouse click. Data is x, y of their mouse position on their canvas.
*/

require.config({
	paths: {
	//	"jsaSound": ".."
	}
});
require(
	["utils", "memwindow", "oneDdisplay", "../jslibs/raphael-min", "../jslibs/numeric-1.2.6"],

	function (utils, memwindow, oneDdisplay) {
        // System parameters ----------
        var numUnits=1; // the number of simultaneous sets of equations (diffEQs) being run and visualized
        var g_stepSize=.20;
        var g_trailLength=25;

        // Equation variable to display on the phase plane
        var phasePlaneXVar=1;  
        var phasePlaneYVar=3;

        // displayScale and displayTranslate variable values to pixels
        var displayScaleX = 150;
        var displayScaleY = 150;
        var displayTranslateX = 0; 
        var displayTranslateY = 0; 
        //----------------------------------------------------------
        var numVars=4; // MUST be equal to number of EQs in diffEQ.
        //-----------------------------------------------------------
        // The equations
        //Talking at the same time
        /*
        var diffEQ = function(t, x){ 
            return [0 + alpha[0]*(x[0]+x[2])-beta[0]*x[1]*x[0] ,
                    0-gamma[0]*x[1] + delta[0]*x[0]*x[1] ,
                    0 + alpha[1]*(x[0]+x[2])-beta[1]*x[3]*x[2] ,
                    0-gamma[1]*x[3] + delta[1]*x[2]*x[3]
                    ];
            }
        */

        
        var diffEQ = function(t, x){ 
            return [
                    alpha[0]*(x[0]*x[3])       - beta[0]*(x[0]*x[1]) , //x0
                    -gamma[0]*(x[1]*x[3])      + delta[0]*x[0],      //x1
                    alpha[1]*(x[2]*x[1])       - beta[1]*(x[2]*x[3]),  //x2
                    -gamma[1]*(x[1]*x[3])      + delta[1]*x[2]       //x3
                    ];
            }
        

/*
        var diffEQ = function(t, x){ 

            return [
                sinc*(alpha[0]*(x[0]*x[3])       - beta[0]*x[0]*x[1]) + (1-sinc)*(alpha[0]*(x[0]+x[2])-beta[0]*x[1]*x[0]) ,
                sinc*(-gamma[0]*(x[1]*x[3])      + delta[0]*x[0])     + (1-sinc)*(-gamma[0]*x[1] + delta[0]*x[0]*x[1]) ,
                sinc*(alpha[1]*(x[2]*x[1])       - beta[1]*x[2]*x[3]) + (1-sinc)*(alpha[1]*(x[0]+x[2])-beta[1]*x[3]*x[2]) ,
                sinc*(-gamma[1]*(x[1]*x[3])      + delta[1]*x[2])     + (1-sinc)*(-gamma[1]*x[3] + delta[1]*x[2]*x[3]) 
                    ];
            }
*/



        console.log("diffEQ is " + diffEQ);
        //-----------------------------------------------------------------

        var myrequestAnimationFrame = utils.getRequestAnimationFrameFunc();

        var svgElmt = document.getElementById("SimpleDiv");
        var pWidth = svgElmt.width.baseVal.value;
        var pHeight = svgElmt.height.baseVal.value;

        var paper = Raphael(document.getElementById("SimpleDiv"), pWidth, pHeight);

        console.log("pWidth is " + pWidth + ", and pHeight is " + pHeight);

        var prect = paper.rect(0,0, pWidth, pHeight);
        prect.attr("fill", "#000"); //fill-opacity
        prect.toBack();

        // paper for drawing value histories (memwindows)
        convTracePaper=oneDdisplay("footerdiv")
        
        // For drawing a trace of one variable over a recency window
        mem1=memwindow();
        mem1.historyIndex=(function(){idx=[]; for(var i=0;i<mem1.maxHistoryLength;i++)idx.push(Math.round(i*pWidth/mem1.maxHistoryLength)); return idx;})();
 
        mem2=memwindow();      
        mem2.historyIndex=(function(){idx=[]; for(var i=0;i<mem2.maxHistoryLength;i++)idx.push(Math.round(i*pWidth/mem2.maxHistoryLength)); return idx;})();


        //-------------------------------------------
        // just to keep track of things for drawing
        var unitGenerator=function(){
            var unit = {
                "f": function(){},
                "vals": [], // stores the values returned from the diffeq solver
                // keep path history (pop old, and push new on each solving epoch)
                "pathHistory": {"maxSegments": g_trailLength, 
                                "seg":[],
                                "newseg": function(segment){
                                    this.seg.push(segment);
                                    if (this.seg.length > this.maxSegments){
                                        this.seg[0].remove(); // from the canvas
                                        this.seg.shift();     // remove from the history list      
                                    }
                                }
                               },
                "drawing":{
                    "color": "#fff",
                    "stateGraphic": null,
                    "makeStateGrahic": function(size){
                        this.stateGraphic = paper.circle(-100, -100, 3); // initially off screen
                        this.stateGraphic.attr("fill", this.color);
                        this.stateGraphic.attr("stroke", this.color);
                        this.stateGraphic.toFront();

                    }
                }
            };
            return unit;
        }

        //-----------------------------------------------------
        // Parameters from slider interfaces 

        var sincSlider = document.getElementById("SynchronyID");
        var sinc = sincSlider.value;
        sincSlider.addEventListener("input", function(ev){
            sinc=ev.target.value;
            console.log ("setting sinc to  " + sinc);
        });

        // alpha
        var alpha_mid=1;
        var alpha_spread=.5;
        var alpha=[], alphaSlider=[]; 
        alphaSlider[0] = document.getElementById("alphaID[0]");
        alphaSlider[1] = document.getElementById("alphaID[1]");
        alpha[0]=alpha_mid;
        alpha[1]=alpha_mid;
        document.getElementById("alphaValBox[0]").value = alpha[0];
        document.getElementById("alphaValBox[1]").value = alpha[1];


        alphaSlider[0].addEventListener("input", function(){
            alpha[0]=(alpha_mid-alpha_spread/2.0) + alphaSlider[0].value*(alpha_spread);
            document.getElementById("alphaValBox[0]").value = alpha[0];
        });
        alphaSlider[1].addEventListener("input", function(){
            alpha[1]=(alpha_mid-alpha_spread/2.0) + alphaSlider[1].value*(alpha_spread);
            document.getElementById("alphaValBox[1]").value = alpha[1];
        });

        // beta
        var beta_mid=1;
        var beta_spread=.6;
        var beta=[], betaSlider=[]; 
        betaSlider[0] = document.getElementById("betaID[0]");
        betaSlider[1] = document.getElementById("betaID[1]");
        beta[0]=beta_mid;
        beta[1]=beta_mid;
        document.getElementById("betaValBox[0]").value = beta[0];
        document.getElementById("betaValBox[1]").value = beta[1];

        betaSlider[0].addEventListener("input", function(){
            beta[0]=(beta_mid-beta_spread/2.0) + betaSlider[0].value*(beta_spread);
            document.getElementById("betaValBox[0]").value = beta[0];
        });
        betaSlider[1].addEventListener("input", function(){
            beta[1]=(beta_mid-beta_spread/2.0) + betaSlider[1].value*(beta_spread);
            document.getElementById("betaValBox[1]").value = beta[1];
        });


        // gamma
        var gamma_mid=1;
        var gamma_spread=.5;
        var gamma=[], gammaSlider=[]; 
        gammaSlider[0] = document.getElementById("gammaID[0]");
        gammaSlider[1] = document.getElementById("gammaID[1]");
        gamma[0]=gamma_mid;
        gamma[1]=gamma_mid;
        document.getElementById("gammaValBox[0]").value = gamma[0];
        document.getElementById("gammaValBox[1]").value = gamma[1];


        gammaSlider[0].addEventListener("input", function(){
            gamma[0]=(gamma_mid-gamma_spread/2.0) + gammaSlider[0].value*(gamma_spread);
            document.getElementById("gammaValBox[0]").value = gamma[0];
        });
        gammaSlider[1].addEventListener("input", function(){
            gamma[1]=(gamma_mid-gamma_spread/2.0) + gammaSlider[1].value*(gamma_spread);
            document.getElementById("gammaValBox[1]").value = gamma[1];
        });

        // delta
        var delta_mid=1;
        var delta_spread=.5;
        var delta=[], deltaSlider=[]; 
        deltaSlider[0] = document.getElementById("deltaID[0]");
        deltaSlider[1] = document.getElementById("deltaID[1]");
        delta[0]=delta_mid;
        delta[1]=delta_mid;
        document.getElementById("deltaValBox[0]").value = delta[0];
        document.getElementById("deltaValBox[1]").value = delta[1];


        deltaSlider[0].addEventListener("input", function(){
            delta[0]=(delta_mid-delta_spread/2.0) + deltaSlider[0].value*(delta_spread);
            document.getElementById("deltaValBox[0]").value = delta[0];
        });
        deltaSlider[1].addEventListener("input", function(){
            delta[1]=(delta_mid-delta_spread/2.0) + deltaSlider[1].value*(delta_spread);
            document.getElementById("deltaValBox[1]").value = delta[1];
        });

        // ----------------------------------------
        var valTextBox=[];
        valTextBox[0]=document.getElementById("x0BoxID");
        valTextBox[1]=document.getElementById("x1BoxID");
        valTextBox[2]=document.getElementById("x2BoxID");
        valTextBox[3]=document.getElementById("x3BoxID");

        // -----------------------------------------
        // Sets a new "initial value" in the two dimensions being displayed on the phase plane
        svgElmt.addEventListener("click", function(ev){
            console.log("mouse click at phase plane pt " + ev.offsetX/displayScaleX + ", " + ev.offsetY/displayScaleY)
            var len=unit[0].vals[phasePlaneXVar].length-1;
            
            // reset all variable to something reasonable 
            for(var j=0;j<numVars;j++){
                unit[0].vals[j][len] = Math.random()*2;
            }
            // now reset vars displayed in phase plane to mouse click position
            unit[0].vals[phasePlaneXVar][len] = ev.offsetX/displayScaleX;
            unit[0].vals[phasePlaneYVar][len] = ev.offsetY/displayScaleY;
        });

        //-----------------------------------------------------------------
        // initialize units
        var unit = [];
        for(var i=0;i<numUnits;i++){
            //unit[i] = unitGenerator([[0, -5, 10],[0, 28, -1, 0, 0, 0, -1],[0, 0, 0, -8/3, 0, 1]]);
            unit[i]= unitGenerator();
            unit[i].f = diffEQ;  // for now they will all use the same function - if we change the diffEQ funciton, all units will see it without having to reset unit.f
            unit[i].drawing.makeStateGrahic(5);
        }

        solvestepper=function(){
            var t=0;
            var step=g_stepSize;
            
            var sol;  // raw solution from solver
            var solX;  // x variable solution, scaled and shifted for plotting
            var solY;  // y variable solution, scaled and shifted for plotting
            var pathString; // solution converted to SVG path string


            for(var i=0;i<numUnits;i++){
                unit[i].vals = [[0+Math.random()*2],[0+Math.random()*2],[0+Math.random()*2], [0+Math.random()*2]];  // initial value   Isley Bros
                unit[i].drawing.color=utils.hslToRgb(Math.random(), .75, .75);
            }


            var summaryVoice=0;
            // solve for the next time segment (from now, to now+step)
            // For each tick, draw the new segment, and remove the oldest segment
            (function tick(){
                //console.log("pathHistoryase loc: " + y[0].last() + ", " + y[1].last() + ", " +  y[2].last());
                for(var i=0;i<numUnits;i++){
                    sol = numeric.dopri(t,t+step,[unit[i].vals[0].last(),unit[i].vals[1].last(), unit[i].vals[2].last(), unit[i].vals[3].last()], unit[i].f,1e-6,2000);
                    // matrix transpose because each y[n] is of length numvars, and we want each var in its own array
                    unit[i].vals = numeric.transpose(sol.y);

                    for(var j=0;j<numVars;j++)
                        valTextBox[j].value=unit[i].vals[j].last();

                    //summaryVoice+=unit[i].vals[0].last();
                    //console.log("---------   (x,y) =  (" + unit[i].vals[0].last() + ", " + unit[i].vals[1].last() + ")");

                    solX=unit[i].vals[phasePlaneXVar].scale(displayScaleX).translate(displayTranslateX);
                    solY=unit[i].vals[phasePlaneYVar].scale(displayScaleY).translate(displayTranslateY);

                    // plot one variable vs the other in phase space
                    pathString = utils.atopstring(solX,solY);
                    unit[i].pathHistory.newseg(paper.path(pathString).attr("stroke", unit[i].drawing.color));
                    unit[i].drawing.stateGraphic.attr("cx", solX.last());
                    unit[i].drawing.stateGraphic.attr("cy", solY.last());
                }

                // save the traces and visualize them on the one-D paper
                // Note that this only uses SolX and SolY from uint[numUnits-1]
                mem1.addHistory(solX.last());
                mem2.addHistory(solY.last());
                convTracePaper.clear();
                convTracePaper.plot(mem1.historyIndex, mem1.history, "#0000FF");
                convTracePaper.plot(mem2.historyIndex, mem2.history, "#00FF00");


                t+=step;
                myrequestAnimationFrame(tick);
            })();
        }

        solvestepper();

		console.log("main is loaded");

	}
);