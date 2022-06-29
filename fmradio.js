eval(STOR.read("button.js"));
eval(STOR.read("selector.js"));
eval(STOR.read("bardisp.js"));

var VOL=45;
var STATE=0;  //0 = VOLUME, 1 = FREQ, 2= STATION, 5 = NOTHING
var FREQ = 9320;
var RSSI =0;
var SNR =0;
var STEREO=0;
var LOWBAND = 8750;
var HIGHBAND = 10790;
var buf = Graphics.createArrayBuffer(140,50,1,{msb:true});
eval(STOR.read("rds.js"));

var STATIONS = STOR.readJSON("stations.json")||[]
STATIONS.sort((a,b)=>{
  if(a.station<b.station)return -1;
  if(a.station>b.station)return 1;
  return 0;
});

var STATSEL  = new Selector(STATIONS,220,120);
    
var BUTTONS=[
    new Button("Scan+",80, 120, 60, 32, ()=>{scan(true,0);}),
    new Button("Scan-",80, 160, 60, 32, ()=>{scan(false,1);}),
    new Button("Mute",80, 200, 60, 32, (b)=>{RADIO.mute(b);}),
    new Button("Tune",10, 120, 60, 32, (b)=>{setSelector(b,1,4,5);}),
    new Button("Vol",10, 160, 60, 32, (b)=>{setSelector(b,0,3,5);}),
    new Button("Pre",10, 200, 60, 32, (b)=>{setSelector(b,2,3,4)}),
    new Button("RDS",150, 120, 60, 32, (b)=>{if (b) rdsStart(); else rdsStop();}),
    new Button("Add",150,160,60,32,(b)=>{addStation(b)}),
    new Button("Del",150,200,60,32,(b)=>{delStation(b)})
];

function addStation(b){
  if(b && SEGMENTS==15) {
    STATSEL.add(getname(),FREQ);
    STATSEL.draw(1);
    STOR.writeJSON("stations.json",STATIONS);
  }
  BUTTONS[7].reset();
}

function delStation(b){
  if(b && BUTTONS[5].press) {
    STATSEL.del();
    STATSEL.draw(1);
    if (STATIONS.length!=0) setTune(STATSEL.freq());
    STOR.writeJSON("stations.json",STATIONS);
  }
  BUTTONS[8].reset();
}

var VOLDISP = new BarDisp("VOL:",45,100,VOL);

function drawFreq(){
  buf.clear();
  buf.setFont("Vector",48).setFontAlign(1,0).drawString((FREQ/100).toFixed(1),135,30);
  g.setColor(-1).drawImage(buf,110,20);
}

function drawSignal(){
  g.setColor(Yellow);
  g.setFont('6x8').setFontAlign(-1,-1).drawString("RSSI: "+RSSI+"   ",18,12,true);
  g.setFontAlign(0,-1).drawString(STEREO==1?"Stereo":"      ",160,12,true);
  g.setFontAlign(-1,-1).drawString("SNR: "+SNR+" ",260,12,true);
}

function drawBat(){
  var v = 7.15*analogRead(D35);
  g.setColor(Yellow).setFont('6x8').setFontAlign(-1,-1).drawString("BAT: "+v.toFixed(1)+"V",248,100,true);
}

function drawFM(){
    g.setColor(Grey).fillRect(0,0,319,239);
    g.clearRect(10,10,310,110);
    g.setColor(-1).setFont("Vector",20).setFontAlign(-1,0).drawString("MHz",250,50);
    VOLDISP.draw();
    STATSEL.draw();
    for (var i=0;i<BUTTONS.length;i++) BUTTONS[i].draw();
    drawFreq();
    drawSignal();
    drawBat();
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
  rdsClear();
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
    RADIO.setProp(0xFF00,0); //turn off debug see AN332 re noise
    //RADIO.setProp(0x1800,127); // set to blend set to mono
    //RADIO.setProp(0x1801,127); // mono blend threshold - force mono
    RADIO.volume(VOL);
}

function setSelector(b,st,b1,b2){
  if (b) STATE=st; else return;
  BUTTONS[b1].reset();
  BUTTONS[b2].reset();
  STATSEL.draw(STATE==2);
  if (STATE==2 && STATIONS.length!=0) setTune(STATSEL.freq()); else drawFreq();
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
          VOLDISP.update(VOL);
          RADIO.volume(VOL);
      } else if (STATE==2) {
        STATSEL.move(inc);
        if (STATIONS.length!=0) setTune(STATSEL.freq());
      }     
    };
    ROTARY.on("change",ROTARY.handler);     
    RADIO.signalQPoll = setInterval(()=>{
        var r = RADIO.getSQ();
        SNR=r.snr; RSSI=r.rssi; STEREO=r.stereo;
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
    if (BUTTONS[6].press) rdsStart();
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
  rdsStop();
}

eval(STOR.read("keyboard.js"));

function toKBD() {
  SCREEN=1;
  clearControls();
  g.setColor(Grey).fillRect(0,0,319,239);
  KBD.enable(true).draw();
}

function toRADIO() {
  SCREEN=0;
  KBD.enable(false);
  if (KBD.valid()) {
    setTune(KBD.freq());
    SELECTED=-1;
  }
  setControls();
  drawFM();
}

var KBD = new Keyboard(LOWBAND,HIGHBAND,toRADIO,false).init();

var SCREEN = 0;

TC.swipeHandler = (dir) => {
  if (dir == TC.DOWN && SCREEN == 0) {
    toKBD();
    return;
  }
  if (dir == TC.UP && SCREEN == 1) {
    toRADIO();
    return;
  }
};

TC.on("swipe",TC.swipeHandler);

initRADIO();
drawFM();
setControls();

