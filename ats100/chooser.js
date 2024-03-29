g.clear();
g.drawImage(STOR.read("smallradio"),10,5);
g.setColor(-1).setFont("Vector",18).drawString("Espruino Radio",70,30);
eval(STOR.read("button.js"));
var FMBUTTON = new Button("FM",0,70,50,30,()=>{load("fmapp.js");},20);
var AMBUTTON = new Button("AM",60,70,50,30,()=>{load("amapp.js");},20);
var SSBUTTON = new Button("SSB",120,70,50,30,()=>{load("ssbapp.js");},20);
var OFFBUTTON = new Button("OFF",180,70,50,30,()=>{load();},20);

var ITEMS=[FMBUTTON,AMBUTTON,SSBUTTON,OFFBUTTON];

var prevpos =3;
var position=3;

function move(inc){
        function mod(a,n) {return a>=n?a-n:a<0?a+n:a;}
        position=mod(position+inc,ITEMS.length);
        ITEMS[prevpos].focus(false);
        ITEMS[position].focus(true);
        prevpos=position;
    }

ROTARY.on("change",(inc)=>{move(inc);});  
BUTTON.on("change",(d)=>{ITEMS[position].toggle(d);});

g.setColor(-1).setFont("6x8",1).setFontAlign(0,-1).drawString("Long touch to return to this screen.",120,110);

for (var i=0;i<ITEMS.length;i++) 
  ITEMS[i].focus(i==position);
