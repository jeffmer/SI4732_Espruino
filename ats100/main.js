var STOR = require("Storage");
eval(STOR.read("st7789v.js"));
var g = ST7789();
brightness(1);
const Grey = g.toColor(0.8,0.8,0.8);
const Green = g.toColor(0,0.7,0);
const Yellow = g.toColor(1,1,0);
const Blue = g.toColor(0,0,1);
eval(STOR.read("encoder.js"));
var ROTARY = createEncoder(D33,D32);
//eval(STOR.read("si4735.js"));
//RADIO.reset();

function createSwitch(pinA){
  pinMode(pinA,"input_pullup");
  var OBJ = {};
  var state = pinA.read();
  
  function handler(){
    var ns = pinA.read();
    if (state!=ns){
      OBJ.emit("change",!ns);
      state=ns;
    }
  }
  setWatch(handler,pinA,{repeat:true,edge:"both"});
  return OBJ;
}
var BUTTON = createSwitch(D2);

function getBattery() {return 7.24 * analogRead(D35);}




eval(STOR.read("selector.js"));
eval(STOR.read("button.js"));

var bandchange =  false;

var BANDS = (STOR.readJSON("bands.json")||[]).filter((e)=>{return e.mod=="AM";});
var BANDSEL = new Selector(BANDS,148,83,(b)=>{bandchange=b;});

var ITEMS=[
    new Button("Scan+",0,  83, 44, 23, ()=>{},12),
    new Button("Scan-",49, 83, 44, 23, ()=>{},12),
    new Button("Mute" ,98,83, 44, 23, ()=>{},12),
    new Button("RDS",  0, 111, 44, 23, ()=>{},12),
    new Button("Add",  49,111, 44, 23,()=>{},12),
    new Button("Del",  98,111, 44, 23,()=>{},12),
    BANDSEL
]; 

ITEMS.forEach((i)=>{i.draw(false);});

var prevpos =0;
var position=0;

function mod(a,n) {return a>=n?a-n:a<0?a+n:a;}

function move(inc){
        function mod(a,n) {return a>=n?a-n:a<0?a+n:a;}
        if (ITEMS.length==0) return;
        position=mod(position+inc,ITEMS.length);
        ITEMS[prevpos].focus(false);
        ITEMS[position].focus(true);
        prevpos=position;
    }

ROTARY.on("change",(d)=>{if (bandchange) BANDSEL.move(d); else move(d);});

BUTTON.on("change",(d)=>{if(d) ITEMS[position].toggle();});

