// just a little indexed fifo array of fixed length 
define(
    [],
    function(){
        return function(){
            var memwin={};
            memwin.maxHistoryLength=400;
            memwin.history=[].fill(memwin.maxHistoryLength,0);
            memwin.historyIndex=[].fill(memwin.maxHistoryLength); // the time points that the history list corresponds to
            memwin.addHistory =  function(val){
                memwin.history.push(val);
                if (memwin.history.length > memwin.maxHistoryLength){
                    memwin.history.shift();     // remove from the history list      
                }
            }
            memwin.setHistoryLength=function(l){
                memwin.maxHistoryLength=l;
                memwin.history=[].fill(l,0);
                memwin.historyIndex=[].fill(l); // the time points that the history list corresponds to
            }

            return memwin;
        }   
    }
);
