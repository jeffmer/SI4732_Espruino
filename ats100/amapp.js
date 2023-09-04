eval(STOR.read("selector.js"));
eval(STOR.read("button.js"));
eval(STOR.read("bardisp.js"));
eval(STOR.read("freqdisp.js"));

var VOL=32;
var BRIGHT=40;
var SCREENSAVE=120;
var STATE=0;  //0 = SELECT, 1 = VOL, 2= FREQ, 3 = STATION, 4 = BRIGHTNESS
var FREQ = 198;
var RSSI =0;
var SNR =0;
var BANDNAME ="LW";
var LOWBAND = 130;
var HIGHBAND = 279;
var STEP = 9;
var BWindex = 1;
var CAP =0;


var BANDS = (STOR.readJSON("bands.json")||[]).filter((e)=>{return e.mod=="AM";});

var BANDSEL = new Selector(BANDS,148,83,(b)=>{STATE = b?3:0;});
var VOLDISP = new BarDisp("Vol:",28,62,VOL,(b)=>{STATE = b?1:0;});
var BRIGHTDISP = new BarDisp("BL :",28,72,BRIGHT,(b)=>{STATE = b?4:0;});
var FREQDISP = new FreqDisp("KHz",50,19,115,28,0,5,FREQ,(b)=>{STATE = b?2:0;},(f)=>{findBand(f);});
var SCANUP = new Button("Scan+",0,  111, 44, 23, ()=>{scan(true,SCANUP,SCANDOWN);},12);
var SCANDOWN = new Button("Scan-",49, 111, 44, 23, ()=>{scan(false,SCANDOWN,SCANUP);},12);
var STEPSET =  new Button("9",  0,94, 44, 12,(b)=>{changeStep(b);},8);
var BWSET =  new Button("4.0",  49,94, 44, 12,(b)=>{changeBW(b);},8);
var AGCCTL = new Button("agc on",  98,94, 44, 12,(b)=>{changeAGC(b);},8);
var ITEMS=[
    FREQDISP, VOLDISP,BRIGHTDISP, STEPSET, BWSET, AGCCTL, BANDSEL,SCANUP, SCANDOWN,  
    new Button("Mute" ,98,111, 44, 23, (b)=>{RADIO.mute(b);},12),
]; 

var agcindex = 0;
const agcstr = ["agc on", "off", "low", "med", "high"]
function changeAGC(b){
  if (!b) return;
  agcindex = (agcindex+1)%5;
  AGCCTL.str = agcstr[agcindex];
  if (agcindex==0) 
    RADIO.setAGC(true,0);
  else
    RADIO.setAGC(false,(agcindex-1)*3);
  AGCCTL.reset();
}
    
var stepindex= 2;
const steps =[1,5,9,10];
function changeStep(b){
  if (!b) return;
  stepindex = (stepindex+1)%4;
  STEP=steps[stepindex];
  STEPSET.str = STEP.toString();
  STEPSET.reset();
}

const bwidss =[6,4,3,2,1,1.8,2.5];
function changeBW(b,index){
  if (!b) return;
  if (typeof index !== 'undefined') BWindex=index; else BWindex = (BWindex+1)%7;
  RADIO.setProp(0x3102,BWindex);
  BWSET.str = bwidss[BWindex].toFixed(1);
  BWSET.reset();
}

function drawBand() {
  g.setColor(Yellow).setFont('6x8').setFontAlign(-1,-1);
  g.drawString("MIN: "+LOWBAND+"KHz   ",148,62,true);
  g.drawString("MAX: "+HIGHBAND+"KHz   ",148,72,true);
  STEPSET.str = STEP.toString(); STEPSET.draw();
}

function drawSignal(){
  g.setColor(Yellow);
  g.setFont('6x8').setFontAlign(-1,-1).drawString("RSSI: "+RSSI+"   ",0,0,true);
  g.setFontAlign(-1,-1).drawString("SNR : "+SNR+" ",95,0,true);
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

function findBand(f){
    var bi = BANDS.findIndex((e)=>{return f<=e.max && f>=e.min;});
    if (bi>=0) {
      BANDSEL.pos=bi;
      BANDSEL.draw(true);
      setBand(f);
    }
}

function setTune(f){
  RADIO.tuneAM(f,CAP);
  while(!RADIO.endTune());
  var r= RADIO.getTuneStatus();
  FREQ=r.freq; SNR=r.snr; RSSI=r.rssi;
  FREQDISP.update(FREQ);
  drawSignal();
}

var SCANNER=null;
  
function scan(up,thisone,other){
  if (SCANNER) SCANNER=clearInterval(SCANNER);
  if(other.press){other.reset();}
  RADIO.seek(up,false);
  SCANNER=setInterval(()=>{
      if (!RADIO.endTune()) return;
      if (SCANNER) SCANNER=clearInterval(SCANNER);
      var r=RADIO.getTuneStatus();
      FREQ=r.freq; SNR=r.snr; RSSI=r.rssi;
      FREQDISP.update(FREQ); drawSignal();
      thisone.reset();
   },100);
}

function initRADIO(){
    RADIO.reset();
    RADIO.powerAM(true);
    RADIO.setProp(0xFF00,0); //turn off debug see AN332 re noise
    RADIO.setProp(0x3102,BWindex);
    RADIO.setProp(0x3302,0);
    RADIO.volume(VOL);
    setBand();
    RADIO.setAGC(true,0);
}

var prevpos =0;
var position=0;

function move(inc){
        function mod(a,n) {return a>=n?a-n:a<0?a+n:a;}
        position=mod(position+inc,ITEMS.length);
        ITEMS[prevpos].focus(false);
        ITEMS[position].focus(true);
        prevpos=position;
    }

function setControls(){ 
    ROTARY.handler = (inc) => {
        if (SCREENSAVE<=0) 
            brightness(BRIGHT/63);
        else if (FREQDISP.edit) 
            FREQDISP.adjust(inc);
        else if (STATE==0) 
            move(inc);
        else if (STATE==2){
            FREQ+=(inc*STEP);
            FREQ = FREQ<LOWBAND?LOWBAND:FREQ>HIGHBAND?HIGHBAND:FREQ;
            setTune(FREQ);
        } else if(STATE==1) {
            VOL+=inc*4;
            VOL=VOL<0?0:VOL>63?63:VOL;
            VOLDISP.update(VOL);
            RADIO.volume(VOL);
        } else if(STATE==4) {
            BRIGHT+=inc*4;
            BRIGHT=BRIGHT<5?5:BRIGHT>63?63:BRIGHT;
            BRIGHTDISP.update(BRIGHT);
            brightness(BRIGHT/63);
        } else if (STATE==3) {
          BANDSEL.move(inc);
          if (BANDS.length!=0) setBand();
        } 
        SCREENSAVE = 120;    
    };
    ROTARY.on("change",ROTARY.handler);  
    BUTTON.on("change",(d)=>{
      if (SCREENSAVE<=0) brightness(BRIGHT/63); else ITEMS[position].toggle(d);
      SCREENSAVE = 120;
    });
    BUTTON.on("doubleclick",()=>{if (FREQDISP.focusd) FREQDISP.onDclick();});
}

var s;

function restoreState(){
   s = STOR.readJSON("amstate.json",1)||{frequency:1024, volume:32, bright:40, bandwidth:1};
   VOL=s.volume; VOLDISP.update(VOL); RADIO.volume(VOL);
   BRIGHT=s.bright; BRIGHTDISP.update(BRIGHT); brightness(BRIGHT/63);
   changeBW(true,s.bandwidth);
   findBand(s.frequency);
}

function saveState(){
  s.frequency=FREQ;
  s.volume=VOL;
  s.bright=BRIGHT;
  s.bandwidth=BWindex;
  STOR.writeJSON("amstate.json",s);
}

E.on("kill",saveState);

g.clear();
for (var i=0;i<ITEMS.length;i++) 
  ITEMS[i].focus(i==position);
g.setColor(Yellow).setFont('6x8').setFontAlign(-1,-1).drawString("Step",0,83).drawString("BWid",49,83);
setControls();
initRADIO();
restoreState();
setInterval(()=>{
  var r = RADIO.getSQ();
  SNR=r.snr; RSSI=r.rssi; STEREO=r.stereo;
  drawSignal();
  g.setFontAlign(-1,-1).drawString("BAT: "+getBattery().toFixed(1)+"V",180,0,true);
  if (SCREENSAVE>0) {
    --SCREENSAVE;
    if (SCREENSAVE<=0){
      brightness(0);
    }
  } 
},1000);