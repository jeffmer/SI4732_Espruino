const Grey = g.toColor(0.6,0.6,0.6);
const Green = g.toColor(0,1,0);
const Yellow = g.toColor(1,1,0);
const Blue = g.toColor(0,0,1);

var VOL=35;
var OLDVOL=0;
var TUNEVOL=false;
var FREQ = 9320;
var RSSI =0;
var SNR =0;
var LOWBAND = 8750;
var HIGHBAND = 10790;
var SELECTED = -1;
var buf = Graphics.createArrayBuffer(140,50,1,{msb:true});

var STATIONS = require("Storage").readJSON("stations.json")||[]
var NSTAT = STATIONS.length<=6 ? STATIONS.length : 6;

function drawStation(n,sel){
  var x = 20+Math.floor(n/3)*100;
  var y = 110+(n%3)*40;
  var str = STATIONS[n].station;
  g.setColor(sel?Green:Blue).fillRect({x:x,y:y,x2:x+89,y2:y+31,r:10});
  g.setColor(-1).setFont("Vector",18).setFontAlign(0,0).drawString(str,x+45,y+16);
}

function isStation(p,n){
  var x1 = 20+Math.floor(n/3)*100;
  var y1 = 110+(n%3)*40;
  return (p.x>x1 && p.x<x1+89 && p.y>y1 && p.y<y1+31);
}

var BUTTONS=[{button:"SCAN+",pressed:false, action:null},
            {button:"SCAN-",pressed:false, action:null},
            {button:"MUTE",pressed:false, action:null},
           ];

function drawButton(n,sel){
  var x = 230;
  var y = 110+(n%3)*40;
  var str = BUTTONS[n].button;
  g.setColor(sel?Green:Blue).fillRect({x:x,y:y,x2:x+69,y2:y+31,r:10});
  g.setColor(-1).setFont("Vector",18).setFontAlign(0,0).drawString(str,x+35,y+16);
}

function isButton(p,n){
  var x1 = 230;
  var y1 = 110+(n%3)*40;
  return (p.x>x1 && p.x<x1+69 && p.y>y1 && p.y<y1+31);
}

function drawFreq(){
  buf.clear();
  buf.setFont("Vector",48).setFontAlign(1,0).drawString((FREQ/100).toFixed(1),135,25);
  g.setColor(TUNEVOL?Green:-1).drawImage(buf,90,40);
}

function drawSignal(){
  g.setColor(Yellow);
  g.setFont('6x8').setFontAlign(-1,-1).drawString("RSSI: "+RSSI+"   ",28,22,true);
  g.setFontAlign(-1,-1).drawString("SNR: "+SNR+" ",250,22,true);
}

function drawBat(){
  var v = 7.15*analogRead(D35);
  g.setColor(Yellow).setFont('6x8').setFontAlign(-1,-1).drawString("BAT: "+v.toFixed(1)+"V",238,90,true);
}

function drawVolume(){
  var v = VOL;
  if (v>=OLDVOL) g.setColor(TUNEVOL?Grey:Green).fillRect(55,91,55+v,97);
  if (v<OLDVOL) g.clearRect(55+v,91,123,97);
  OLDVOL=v;
}

function drawFM(){
    g.setColor(Grey).fillRect(0,0,319,239);
    g.clearRect(20,20,300,100);
    g.setColor(-1).setFont("Vector",20).setFontAlign(-1,0).drawString("MHz",230,65);
    g.setColor(Yellow).setFont("6x8",1).setFontAlign(-1,-1).drawString("VOL:",28,90);
    g.setColor(-1).drawRect(54,90,124,98);
    for (var i=0; i<NSTAT; ++i) drawStation(i,i==SELECTED);
    for (var i=0;i<3;i++) drawButton(i,false);
    g.setColor(0).fillRect(219,110,221,220);
    drawFreq();
    drawSignal();
    drawBat();
    drawVolume();
}

function setTune(f){
  RADIO.tune(f);
  while(!RADIO.endTune());
  var r= RADIO.getTuneStatus();
  FREQ=r.freq; SNR=r.snr; RSSI=r.rssi;
  drawFreq();
  drawSignal();
}

var SCANNER=null;

function scan(up,n){
  if (SCANNER) SCANNER=clearInterval(SCANNER);
  if(!TUNEVOL && SELECTED>=0) {drawStation(SELECTED,false); SELECTED=-1;}
  if(BUTTONS[(n+1)%2].pressed){BUTTONS[(n+1)%2].pressed=false; drawButton((n+1)%2,false);}
  RADIO.seek(up,false);
  SCANNER=setInterval(()=>{
      if (!RADIO.endTune()) return;
      if (SCANNER) SCANNER=clearInterval(SCANNER);
      var r=RADIO.getTuneStatus();
      FREQ=r.freq; SNR=r.snr; RSSI=r.rssi;
      drawFreq(); drawSignal();
      BUTTONS[n].pressed=false;
      drawButton(n,false);
   },100);
}

BUTTONS[0].action = function() {scan(true,0);};
BUTTONS[1].action = function() {scan(false,1);};
BUTTONS[2].action = function() {RADIO.mute(BUTTONS[2].pressed);};

function initRADIO(){
    RADIO.reset();
    RADIO.powerFM(true);
    RADIO.setProp(0x12,0xFF00,0); //turn off debug see AN332 re moise
    RADIO.volume(VOL);
}

function setControls(){ 
    watchD33(()=>{
      TUNEVOL=!TUNEVOL;
      if(TUNEVOL && SELECTED>=0) drawStation(SELECTED,false); 
      drawVolume();
      drawFreq();
    });
    ROTARY.on("change",(inc)=>{
        if (TUNEVOL)
           {FREQ+=(inc*10);
            FREQ = FREQ<LOWBAND?LOWBAND:FREQ>HIGHBAND?HIGHBAND:FREQ;
            setTune(FREQ);
        } else {
            VOL+=inc;
            VOL=VOL<0?0:VOL>63?63:VOL;
            drawVolume();
            RADIO.volume(VOL);
        }
      });     
      setInterval(()=>{
        var r = RADIO.getSQ();
        SNR=r.snr; RSSI=r.rssi;
        drawSignal();
        drawBat();
      },500);
      TC.on("touch",function (p){
        if (!TUNEVOL)
        for (var i =0; i<NSTAT; ++i) 
          if (isStation(p,i)) {
            if (SELECTED>=0) drawStation(SELECTED,false);
            drawStation(i,true);
            setTune(STATIONS[i].freq);
            SELECTED=i;
            return;
          }
       for (var j =0; j<3; ++j) 
        if (isButton(p,j)) {
          BUTTONS[j].pressed=!BUTTONS[j].pressed;
          drawButton(j,BUTTONS[j].pressed);
          BUTTONS[j].action();
        }
      });
}

initRADIO();
drawFM();
setControls();
                    