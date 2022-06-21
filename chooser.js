const Grey = g.toColor(0.6,0.6,0.6);
const Green = g.toColor(0,1,0);
const Yellow = g.toColor(1,1,0);
const Blue = g.toColor(0,0,1);

g.setColor(Grey).fillRect(0,0,319,239);

eval(STOR.read("button.js"));
var FMBUTTON = new Button("FM",50,150,100,50,()=>{load("fmradio.js");},32);
var AMBUTTON = new Button("AM",200,150,100,50,()=>{load("amradio.js");},32);

FMBUTTON.draw();
AMBUTTON.draw();


TC.on("touch",(p)=>{FMBUTTON.actOnTouch(p);
                    AMBUTTON.actOnTouch(p);
                   });
