var STOR = require("Storage");
eval(STOR.read("st7789v.js"));
var g = ST7789();
brightness(40/63);
const Grey = g.toColor(0.8,0.8,0.8);
const DarkGrey = g.toColor(0.3,0.3,0.3);
const Green = g.toColor(0,0.7,0);
const Yellow = g.toColor(1,1,0);
const Blue = g.toColor(0,0,1);
const Cyan = g.toColor(0,1,1);
eval(STOR.read("encoder.js"));
var ROTARY = createEncoder(D33,D32);
eval(STOR.read("si4735.js"));
RADIO.reset();

function createSwitch(pinA){
  pinMode(pinA,"input_pullup");
  var OBJ = {};
  var lastpush;
  var TO;
  
  function handler(ns){
    if (TO) TO = clearTimeout(TO);
    if (!ns.state && (ns.time-lastpush)<0.5) 
      OBJ.emit("doubleclick");
    else 
      OBJ.emit("change",!ns.state);
    if(!ns.state) {
      lastpush=ns.time;
      TO = setTimeout(()=>{OBJ.emit("longpush");},1500); 
    }
  }
  setWatch(handler,pinA,{repeat:true,edge:"both",debounce:25});
  return OBJ;
}

var BUTTON = createSwitch(D2);
function getBattery() {return 7.24 * analogRead(D35);}

BUTTON.on("longpush",()=>load("chooser.js"));
