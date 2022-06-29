eval(STOR.read("button.js"));
eval(STOR.read("selector.js"));
eval(STOR.read("bardisp.js"));

Graphics.prototype.setFontDMMono = function(scale) {
  // Actual height 27 (26 - 0)
  this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAB8AAAAfAAAAHwAAAB8AAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAOAAAAfgAAAf4AAA/8AAA/4AAB/4AAB/4AAD/wAAD/wAAD/gAAD/gAAA/AAAAPAAAACAAAAAAAAAAAAAAAAAAAAAAf/gAAf/+AAP//wAH//+AB8APgA+Af8APAf/ADgf5wA4/4cAP/4PAD/wDwA/wB8AH4B+AA///AAH//gAA//wAAD/wAAAAAAAAAAAAAAAAAAOAAcADgAHAB4ABwAeAAcAHAAHAD///wA///8AP///AD///wAAAAcAAAAHAAAABwAAAAcAAAAHAAAABwAAAAAAAAAAAAAAAAAAAAMAB4APAA+ADwAfgB8AHwA/ADwAfwA8AP8AOAD3ADgB5wA8B8cAPA+HAD9/BwAf/gcAD/wHAAfwBwAAAAcAAAAAAAAAAAAAAAAAAABgAAcA+AAPAPwAHwB+AB8AHgA8AA8APDgPADg4BwA4OAcAODgHADx8DwA//A8AH//+AB/P/gAPh/wAAAPwAAAAAAAAAAAAAAAAAAAA4AAAA+AAAAfgAAAf4AAAP+AAAPzgAAH44AAD4OAAD8DgAB8A4AA+AOAAP///AD///wA///8AAADgAAAA4AAAAOAAAAAAAAAAAAAAAGAAAfx4AD/8fAA//H4AP/g+ADhwDwA48A8AOOAHADjgBwA44AcAOPAPADjwHwA4fD4AOH/8ADg/+AAAD/AAAAAAAAAAAAAAAAAAAAQAAAD/4AAD//gAD//8AB/f/gAePB4APDgPADx4DwA4cAcAOHAHADhwBwA8eA8APHwfAB4//gAfH/wADw/4AAMD4AAAAAAAAAAAAAAAAAA4AAAAOAAAADgAAAA4AAEAOAAPADgAPwA4AP8AOAP+ADgf8AA4f8AAOf8AAD/4AAA/4AAAP4AAAD4AAAAAAAAAAAAAAAAAAAAAAfAAB8P4AA/n/AAf//4AP/4fADw+DwA4PAcAOBwHADgcBwA4HAcAPD4PAD5+DwAf//4AD/f+AAfj/AAAAfAAAAAAAAAAAAAAAAAAAfAwAAf4OAAP/DwAH/4+AD4fHwA8Dw8AOAcHADgHBwA4BwcAOAcPADwPDwA+Hh4AH/z+AA///AAH//AAAf/gAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgHgAB8B8AAfAfAAHwHwAB8B8AAEAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='),
    46,
    19,
    32+(scale<<8)+(1<<16)
  );
  return this;
}


var VOL=35;
var STATE=0;  //0 = VOLUME, 1 = FREQ, 2= BAND, 5 = DO Nothing
var TUNEDFREQ=0;   //Hz
var FREQ = 0;          //x 10000 Hz
var BFO = 0;
var RSSI =0;
var SNR =0;
var BANDNAME ="LW";
var LOWBAND = 4700;
var HIGHBAND = 5500;
var MOD="USB";
var SSB_MODE=0x9001; //AFC disable, AVC enable, bandpass&cutoff, 2.2Khz BW
var STEP = 1000;
var BWindex = 1;
var CAP =1;

var BANDS = (STOR.readJSON("bands.json")||[]).filter((e)=>{return e.mod!="AM";});

var BANDSEL  = new Selector(BANDS,220,120);

var VOLDISP = new BarDisp("VOL:",45,100,VOL);
    
var BUTTONS=[
    new Button("U/L",80, 120, 60, 32, (b)=>{changeSideBand(b,0);}),
    new Button("BWid",80, 160, 60, 32, (b)=>{changeBW(b,1);}),
    new Button("Mute",80, 200, 60, 32, (b)=>{RADIO.mute(b);}),
    new Button("Tune",10, 120, 60, 32, (b)=>{setSelector(b,1,4,5);}),
    new Button("Vol",10, 160, 60, 32, (b)=>{setSelector(b,0,3,5);}),
    new Button("Band",10, 200, 60, 32, (b)=>{setSelector(b,2,3,4);}),
];

function changeSideBand(b,n){
  if (!b) return;
  MOD = MOD=="USB"?"LSB":"USB";
  g.setFont('6x8').setFontAlign(0,-1).drawString(MOD,160,12,true);
  setTune(TUNEDFREQ,true); //force tune to change side band
  setTimeout(()=>{BUTTONS[n].reset();},200);
}


var stepindex= 2;
const steps =[10,100,1000,10000];

function changeStep(n){
  function mod(a,n) {return a>=n?a-n:a<0?a+n:a;}
  stepindex+=n;
  stepindex = mod(stepindex,4);
  STEP=steps[stepindex];
  g.setColor(-1).setFont('6x8').setFontAlign(-1,-1).drawString("STEP: "+STEP+"Hz   ",18,78,true);
  g.clearRect(160,70,265,74);
  var x = 242 - (stepindex<2?stepindex:stepindex+1)*18;
  g.setColor(-1).fillRect(x,70,x+16,74);
}

const bwidss =[1.2,2.2,3,4,0.5,1];
function changeBW(b,n){
  if (!b) return;
  BWindex = (BWindex+1)%6;
  var pat = bwidss[BWindex]<2.5 ? BWindex : 0x10 | BWindex;
  SSB_MODE = (SSB_MODE & 0xFF00) | pat;
  RADIO.setProp(0x0101,SSB_MODE);
  g.setColor(-1).setFont('6x8').setFontAlign(-1,-1).drawString("Bwid: "+bwidss[BWindex].toFixed(1)+"KHz ",18,42,true);
  setTimeout(()=>{BUTTONS[n].reset();},200);
}

var buf = Graphics.createArrayBuffer(155,40,1,{msb:true});
function drawFreq(){
  buf.clear();
  buf.setFontAlign(1,0).setFontDMMono().drawString((TUNEDFREQ/1000).toFixed(2),153,25);
  g.setColor(-1).drawImage(buf,110,30);
}

function drawBand() {
  g.setColor(Yellow);
  g.setFont('6x8').setFontAlign(-1,-1).drawString("BAND: "+BANDNAME+"      ",18,30,true);
  g.drawString("Bwid: "+bwidss[BWindex].toFixed(1)+"KHz ",18,42,true);
  g.drawString("MIN : "+LOWBAND+"KHz   ",18,54,true);
  g.drawString("MAX : "+HIGHBAND+"KHz   ",18,66,true);
  g.setFontAlign(0,-1).drawString(MOD,160,12,true);

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

function drawSSB(){
    g.setColor(Grey).fillRect(0,0,319,239);
    g.clearRect(10,10,310,110);
    g.setColor(-1).setFont("6x8",2).setFontAlign(-1,0).drawString("KHz",270,50);
    VOLDISP.draw();
    BANDSEL.draw(true);
    for (var i=0;i<BUTTONS.length;i++) BUTTONS[i].draw();
    drawFreq();
    drawBand();
    changeStep(0);
    drawSignal();
    drawBat();
}

function setBand(fkhz) {
  if (BANDS.length!=0) {
    var bd = BANDSEL.selected();
    BANDNAME=bd.name;
    LOWBAND =bd.min;
    HIGHBAND=bd.max;
    if (fkhz) TUNEDFREQ=fkhz*1000; else TUNEDFREQ=bd.freq*1000;
    MOD = bd.mod;
    CAP= (bd.name=="LW" || bd.name=="MW")?0:1;
  }
  drawBand();
  setTune(TUNEDFREQ);
}

function setTune(f,b){
  var newf = 2*Math.round(f/20000);
  BFO = f - newf* 10000;
  if (newf!=FREQ || b){
   FREQ = newf;
   RADIO.tuneSSB(FREQ*10,CAP,MOD=="USB");
   while(!RADIO.endTune());
    var r= RADIO.getTuneStatus();
    SNR=r.snr; RSSI=r.rssi;
    drawSignal();
  }
  RADIO.setProp(0x100,-BFO);
  //console.log("TUNEDFREQ ",TUNEDFREQ,"FREQ ",FREQ,"BFO ",BFO);
  TUNEDFREQ=f;
  drawFreq();
}

function initRADIO(){
    RADIO.reset();
    RADIO.powerSSB(false);
    if(!RADIO.powerSSB(true)) return false;
    RADIO.setProp(0x0101,SSB_MODE);
    RADIO.volume(VOL);
    setBand();
    return true;
}

function setSelector(b,st,b1,b2){
  if (!b) STATE=5; else STATE=st;
  STATE=st;
  BUTTONS[b1].reset();
  BUTTONS[b2].reset();
}

function setControls(){ 
    watchD33();
    ROTARY.handler = (inc) => {
      if (STATE==1){
        if (D33STATE) {
          changeStep(inc);
        } else {
          TUNEDFREQ+=(inc*STEP);
          setTune(TUNEDFREQ);
        }
      } else if(STATE==0) {
          VOL+=inc;
          VOL=VOL<0?0:VOL>63?63:VOL;
          VOLDISP.update(VOL);
          RADIO.volume(VOL);
      } else if (STATE==2) {
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
    setTune(KBD.freq()*1000);
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
  drawSSB();
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

g.clear().setColor(-1).setFont("Vector",24).drawString("Loading SSB patch ...",40,100);
if (initRADIO()){
  drawSSB();
  setControls();
} else g.clear().setColor(-1).setFont("Vector",24).drawString("FAILED to load SSB patch",10,100);

