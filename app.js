const Grey = g.toColor(0.6,0.6,0.6);
const Green = g.toColor(0,1,0);
const Yellow = g.toColor(1,1,0);
const Blue = g.toColor(0,0,1);

eval(STOR.read("button.js"));

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

var SBUTTON = [];
for (var n = 0;n<NSTAT;n++) 
  SBUTTON[n] = new Button(STATIONS[n].station,20+Math.floor(n/3)*100,110+(n%3)*40,90,32);
    
var BUTTONS=[
     new Button("SCAN+",230, 110, 70, 32, ()=>{scan(true,0);}),
     new Button("SCAN-",230, 150, 70, 32, ()=>{scan(false,1);}),
     new Button("MUTE",230, 190, 70, 32, (b)=>{RADIO.mute(b);})
];

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
    for (var i=0; i<NSTAT; ++i) 
        if (i==SELECTED) SBUTTON[i].set(); else SBUTTON[i].reset(); 
    for (var i=0;i<3;i++) BUTTONS[i].draw();
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
  if(!TUNEVOL && SELECTED>=0) {SBUTTON[SELECTED].reset(); SELECTED=-1;}
  if(BUTTONS[(n+1)%2].press){BUTTONS[(n+1)%2].reset();}
  RADIO.seek(up,false);
  SCANNER=setInterval(()=>{
      if (!RADIO.endTune()) return;
      if (SCANNER) SCANNER=clearInterval(SCANNER);
      var r=RADIO.getTuneStatus();
      FREQ=r.freq; SNR=r.snr; RSSI=r.rssi;
      drawFreq(); drawSignal();
      BUTTONS[n].reset();
   },100);
}

function initRADIO(){
    RADIO.reset();
    RADIO.powerFM(true);
    RADIO.setProp(0x12,0xFF00,0); //turn off debug see AN332 re moise
    RADIO.volume(VOL);
}

function setControls(){ 
    watchD33(()=>{
      TUNEVOL=!TUNEVOL;
      if(TUNEVOL && SELECTED>=0) {
        SBUTTON[SELECTED].reset(); 
        SELECTED=-1;
      }
      drawVolume();
      drawFreq();
    });
    ROTARY.handler = (inc) => {
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
    };
    ROTARY.on("change",ROTARY.handler);     
    RADIO.signalQPoll = setInterval(()=>{
        var r = RADIO.getSQ();
        SNR=r.snr; RSSI=r.rssi;
        drawSignal();
        drawBat();
      },500);
    TC.touchHandler = (p) => {
      if (!TUNEVOL)
        for (var i = 0; i < NSTAT; ++i)
          if (SBUTTON[i].isTouched(p)) {
            if (SELECTED >= 0)
            SBUTTON[SELECTED].reset();
            SBUTTON[i].set();
            setTune(STATIONS[i].freq);
            SELECTED = i;
            return;
          }
      for (var j = 0; j < 3; ++j)
        if (BUTTONS[j].isTouched(p)) {
          BUTTONS[j].toggle();
          return;
        }
    };
      TC.on("touch",TC.touchHandler);
}

function clearControls(){
  clearD33();
  if (ROTARY.handler){
    ROTARY.removeListener("change",ROTARY.handler);
    delete ROTARY.handler;
  }
  if (RADIO.signalQPoll) RADIO.signalQPoll = clearInterval(RADIO.signalQPoll);
  if (TC.touchHandler){
    TC.removeListener("touch",TC.touchHandler);
    delete TC.touchHandler;
  }
}

eval(STOR.read("keyboard.js"));

initRADIO();
drawFM();
setControls();

