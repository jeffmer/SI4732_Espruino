const Grey = g.toColor(0.6,0.6,0.6);
const Green = g.toColor(0,1,0);
const Yellow = g.toColor(1,1,0);
const Blue = g.toColor(0,0,1);

g.clear();
g.drawImage(STOR.read("radio.png"),60,20);

eval(STOR.read("button.js"));
var FMBUTTON = new Button("FM",20,160,80,40,()=>{load("fmradio.js");},28);
var AMBUTTON = new Button("AM",120,160,80,40,()=>{load("amradio.js");},28);
var SSBUTTON = new Button("SSB",220,160,80,40,()=>{load("ssbradio.js");},28);

FMBUTTON.draw();
AMBUTTON.draw();
SSBUTTON.draw();
g.setColor(-1).setFont("6x8",1).setFontAlign(0,-1).drawString("Long touch to return to this screen.",160,220);

TC.on("touch",(p)=>{FMBUTTON.actOnTouch(p);
                    AMBUTTON.actOnTouch(p);
                    SSBUTTON.actOnTouch(p);
                   });
