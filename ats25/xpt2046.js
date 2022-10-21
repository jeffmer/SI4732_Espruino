

function createXPT2046(){

    var OBJ = {DOWN:1, UP:2, LEFT:3, RIGHT:4};

    var calib = require("Storage").readJSON("xpt2046.json",1)||{xf:15,xoff:16,yf:11,yoff:35};

    function readXY(){
        if (D34.read()) return;
        setSPI1Freq(2000000)
        D5.reset();
        SPI1.send([0x91,0]);
        var r = SPI1.send([0x91,0,0xD1,0,0]);
        SPI1.send([0x90,0]);
        D5.set();
        setSPI1Freq(20000000);
        var xc = (r[3]*256+r[4])/8;
        xc = 240+calib.xoff-Math.floor(xc/calib.xf);
        xc = xc>239?239:xc<0?0:xc;
        var yc = (r[1]*256+r[2])/8;
        yc = Math.floor(yc/calib.yf) - calib.yoff;
        yc = xc>319?319:yc<0?0:yc;
        return {x:320-yc,y:xc};
    }

    function watch(){
        var first=readXY(); 
        var last = first;
        var count = 0;
        var interval;
        var rewatch = function(){
            if (interval) interval=clearInterval(interval);
            setWatch(watch,D34,{repeat:false,edge:"falling"});
        }
        if (!first) {rewatch(); return;}
        interval = setInterval(()=>{
            if(!D34.read()){
                var t = readXY();
                if(t) last = t;
                ++count;
                if (count>=20) {
                    OBJ.emit("longtouch",last);
                    rewatch();
                }
            } else {
                if (count<20){
                    var xdiff = last.x-first.x;
                    var axdiff = Math.abs(xdiff);
                    var ydiff = last.y-first.y;
                    var aydiff = Math.abs(ydiff);
                    if (axdiff<10 && aydiff<10) {
                        OBJ.emit("touch",last);
                    } else if (axdiff>50 || aydiff>50){
                        OBJ.emit("swipe",(axdiff>=aydiff)?(xdiff>0?OBJ.RIGHT:OBJ.LEFT):(ydiff>0?OBJ.DOWN:OBJ.UP));
                    }
                }
                rewatch();
            }
        },100);
    }

    setWatch(watch,D34,{repeat:false,edge:"falling"});
    return OBJ;
}





