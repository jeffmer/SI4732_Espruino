eval(STOR.read("button.js"));
eval(STOR.read("selector.js"));
eval(STOR.read("bardisp.js"));

var VOL=45;
var STATE=0;  //0 = VOLUME, 1 = FREQ, 2= BAND, 5 = NOTHING
var FREQ = 198;
var RSSI =0;
var SNR =0;
var BANDNAME ="LW";
var LOWBAND = 130;
var HIGHBAND = 279;
var STEP = 9;
var BWindex = 1;
var CAP =0;

var buf = Graphics.createArrayBuffer(140,50,1,{msb:true});

var BANDS = (STOR.readJSON("bands.json")||[]).filter((e)=>{return e.mod=="AM";});

var BANDSEL  = new Selector(BANDS,220,120);
    
var BUTTONS=[
    new Button("Scan+",80, 120, 60, 32, ()=>{scan(true,0);}),
    new Button("Scan-",80, 160, 60, 32, ()=>{scan(false,1);}),
    new Button("Mute",80, 200, 60, 32, (b)=>{RADIO.mute(b);}),
    new Button("Tune",10, 120, 60, 32, (b)=>{setSelector(b,1,4,5);}),
    new Button("Vol",10, 160, 60, 32, (b)=>{setSelector(b,0,3,5);}),
    new Button("Band",10, 200, 60, 32, (b)=>{setSelector(b,2,3,4);}),
    new Button("Step",150, 120, 60, 32, (b)=>{changeStep(b,6);}),
    new Button("BWid",150, 160, 60, 32, (b)=>{changeBW(b,7);})
];

var VOLDISP = new BarDisp("VOL:",45,100,VOL);

var stepindex= 2;
const steps =[1,5,9,10];
function changeStep(b,n){
  if (!b) return;
  stepindex = (stepindex+1)%4;
  STEP=steps[stepindex];
  g.setColor(-1).setFont('6x8').setFontAlign(-1,-1).drawString("STEP: "+STEP+"KHz ",18,66,true);
  setTimeout(()=>{BUTTONS[n].reset();},200);
}

const bwidss =[6,4,3,2,1,1.8,2.5];
function changeBW(b,n){
  if (!b) return;
  BWindex = (BWindex+1)%7;
  RADIO.setProp(0x3102,BWindex);
  g.setColor(-1).setFont('6x8').setFontAlign(-1,-1).drawString("Bwid: "+bwidss[BWindex].toFixed(1)+"KHz ",18,78,true);
  setTimeout(()=>{BUTTONS[n].reset();},200);
}

function drawFreq(){
  buf.clear();
  buf.setFont("Vector",42).setFontAlign(1,0).drawString((FREQ).toFixed(0),135,30);
  g.setColor(-1).drawImage(buf,120,20);
}

function drawBand() {
  g.setColor(Yellow);
  g.setFont('6x8').setFontAlign(-1,-1).drawString("BAND: "+BANDNAME+"      ",18,30,true);
  g.drawString("MIN : "+LOWBAND+"KHz   ",18,42,true);
  g.drawString("MAX : "+HIGHBAND+"KHz   ",18,54,true);
  g.drawString("STEP: "+STEP+"KHz ",18,66,true);
  g.drawString("Bwid: "+bwidss[BWindex].toFixed(1)+"KHz ",18,78,true);
}

function drawSignal(){
  g.setColor(Yellow);
  g.setFont('6x8').setFontAlign(-1,-1).drawString("RSSI: "+RSSI+"   ",18,12,true);
  g.setFontAlign(-1,-1).drawString("SNR: "+SNR+" ",260,12,true);
}

function drawBat(){
  var v = 7.15*analogRead(D35);
  g.setColor(Yellow).setFont('6x8').setFontAlign(-1,-1).drawString("BAT: "+v.toFixed(1)+"V",248,100,true);
}

function drawAM(){
    g.setColor(Grey).fillRect(0,0,319,239);
    g.clearRect(10,10,310,110);
    g.setColor(-1).setFont("Vector",20).setFontAlign(-1,0).drawString("KHz",260,50);
    VOLDISP.draw();
    BANDSEL.draw(true);
    for (var i=0;i<BUTTONS.length;i++) BUTTONS[i].draw();
    drawFreq();
    drawBand();
    drawSignal();
    drawBat();
}

function setBand(f) {
  if (BANDS.length!=0) {
    var bd = BANDSEL.selected();
    BANDNAME=bd.name;
    LOWBAND =bd.min;
    HIGHBAND=bd.max;
    STEP=bd.step;
    if (f) FREQ=f; else FREQ=bd.freq;
    CAP= (bd.name=="LW" || bd.name=="MW")?0:1;
  }
  drawBand();
  RADIO.setProp(0x3400,LOWBAND);
  RADIO.setProp(0x3401,HIGHBAND);
  RADIO.setProp(0x3402,STEP);
  setTune(FREQ);
}

function setTune(f){
  RADIO.tuneAM(f,CAP);
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
    RADIO.powerAM(true);
    RADIO.setProp(0xFF00,0); //turn off debug see AN332 re noise
    RADIO.setProp(0x3102,BWindex);
    RADIO.volume(VOL);
    setBand();
}

function setSelector(b,st,b1,b2){
  if (!b) STATE=5; else STATE=st;
  BUTTONS[b1].reset();
  BUTTONS[b2].reset();
  BANDSEL.draw(true);
  if (STATE==2) setBand();
}

function setControls(){ 
    ROTARY.handler = (inc) => {
      if (STATE==1)
         {FREQ+=(inc*STEP);
          FREQ = FREQ<LOWBAND?LOWBAND:FREQ>HIGHBAND?HIGHBAND:FREQ;
          setTune(FREQ);
      } else if(STATE==0) {
          VOL+=inc;
          VOL=VOL<0?0:VOL>63?63:VOL;
          VOLDISP.update(VOL);
          RADIO.volume(VOL);
      } else {
        BANDSEL.move(inc);
        if (BANDS.length!=0) setBand();
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

var KBD;

function toKBD() {
  SCREEN=1;
  clearControls();
  g.setColor(Grey).fillRect(0,0,319,239);
  KBD = new Keyboard(LOWBAND,HIGHBAND,toRADIO,true).init();
  KBD.enable(true).draw();
}

function toRADIO() {
  SCREEN=0;
  KBD.enable(false);
  if (KBD.valid()) {
    setTune(KBD.freq());
  } else {
    var f = KBD.freq();
    var bi = BANDS.findIndex((e)=>{return f<=e.max && f>=e.min;});
    if (bi>=0) {
      BANDSEL.pos=bi;
      BANDSEL.draw(true);
      setBand(f);
    }
  }
  delete KBD;
  setControls();
  drawAM();
}

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
drawAM();
setControls();

