const Grey = g.toColor(0.6,0.6,0.6);
const Green = g.toColor(0,1,0);
const Yellow = g.toColor(1,1,0);
const Blue = g.toColor(0,0,1);

eval(STOR.read("button.js"));
eval(STOR.read("selector.js"));

var VOL=35;
var OLDVOL=0;
var STATE=0;  //0 = VOLUME, 1 = FREQ, 2= STATION
var FREQ = 9320;
var RSSI =0;
var SNR =0;
var LOWBAND = 8750;
var HIGHBAND = 10790;
var buf = Graphics.createArrayBuffer(140,50,1,{msb:true});
eval(STOR.read("rds.js"));

var STATIONS = require("Storage").readJSON("stations.json")||[]
STATIONS.sort((a,b)=>{
  if(a.station<b.station)return -1;
  if(a.station>b.station)return 1;
  return 0;
});

var STATSEL  = new Selector(STATIONS,220,110);
    
var BUTTONS=[
    new Button("Scan+",80, 110, 60, 32, ()=>{scan(true,0);}),
    new Button("Scan-",80, 150, 60, 32, ()=>{scan(false,1);}),
    new Button("Mute",80, 190, 60, 32, (b)=>{RADIO.mute(b);}),
    new Button("Tune",10, 110, 60, 32, ()=>{setSelector(1,4,5);}),
    new Button("Vol",10, 150, 60, 32, ()=>{setSelector(0,3,5);}),
    new Button("Pre",10, 190, 60, 32, ()=>{setSelector(2,3,4)}),
    new Button("RDS",150, 110, 60, 32, (b)=>{if (b) rdsStart(); else rdsStop();})
];

function drawFreq(){
  buf.clear();
  buf.setFont("Vector",48).setFontAlign(1,0).drawString((FREQ/100).toFixed(1),135,25);
  g.setColor(STATE==1?Green:-1).drawImage(buf,110,40);
}

function drawSignal(){
  g.setColor(Yellow);
  g.setFont('6x8').setFontAlign(-1,-1).drawString("RSSI: "+RSSI+"   ",18,22,true);
  g.setFontAlign(-1,-1).drawString("SNR: "+SNR+" ",260,22,true);
}

function drawBat(){
  var v = 7.15*analogRead(D35);
  g.setColor(Yellow).setFont('6x8').setFontAlign(-1,-1).drawString("BAT: "+v.toFixed(1)+"V",248,90,true);
}

function drawVolume(){
  var v = VOL;
  if (v>=OLDVOL) g.setColor(STATE==0?Green:Grey).fillRect(45,91,45+v,97);
  if (v<OLDVOL) g.clearRect(45+v,91,108,97);
  OLDVOL=v;
}

function drawFM(){
    g.setColor(Grey).fillRect(0,0,319,239);
    g.clearRect(10,20,310,100);
    g.setColor(-1).setFont("Vector",20).setFontAlign(-1,0).drawString("MHz",250,65);
    g.setColor(Yellow).setFont("6x8",1).setFontAlign(-1,-1).drawString("VOL:",18,90);
    g.setColor(-1).drawRect(44,90,109,98);
    STATSEL.draw();
    for (var i=0;i<BUTTONS.length;i++) BUTTONS[i].draw();
    drawFreq();
    drawSignal();
    drawBat();
    drawVolume();
}

function setTune(f){
  RADIO.tune(f);
  rdsClear();
  while(!RADIO.endTune());
  var r= RADIO.getTuneStatus();
  FREQ=r.freq; SNR=r.snr; RSSI=r.rssi;
  drawFreq();
  drawSignal();
}

var SCANNER=null;

function scan(up,n){
  if (SCANNER) SCANNER=clearInterval(SCANNER);
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

function setSelector(st,b1,b2){
  STATE=st;
  BUTTONS[b1].reset();
  BUTTONS[b2].reset();
  STATSEL.draw(STATE==2);
  drawVolume();
  if (STATE==2) setTune(STATSEL.freq()); else drawFreq();
}

function setControls(){ 
    ROTARY.handler = (inc) => {
      if (STATE==1)
         {FREQ+=(inc*10);
          FREQ = FREQ<LOWBAND?LOWBAND:FREQ>HIGHBAND?HIGHBAND:FREQ;
          setTune(FREQ);
      } else if(STATE==0) {
          VOL+=inc;
          VOL=VOL<0?0:VOL>63?63:VOL;
          drawVolume();
          RADIO.volume(VOL);
      } else {
        STATSEL.move(inc);
        setTune(STATSEL.freq());
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
      for (var j = 0; j < BUTTONS.length; ++j)
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

