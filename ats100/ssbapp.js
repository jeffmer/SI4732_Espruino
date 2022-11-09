eval(STOR.read("selector.js"));
eval(STOR.read("button.js"));
eval(STOR.read("bardisp.js"));
eval(STOR.read("freqdisp.js"));
eval(STOR.read("stepdisp.js"));

var VOL=32;
var BRIGHT=40;
var STATE=0;  //0 = SELECT, 1 = VOL, 2= FREQ, 3 = STATION, 4 = BRIGHTNESS, 5= STEPSET
var TUNEORSTEP = false;
var TUNEDFREQ=3303000;   //Hz
var FREQ = 0;      //x 10000 Hz
var BFO = 0;
var RSSI =0;
var SNR =0;
var LOWBAND = 4700;
var HIGHBAND = 5500;
var MOD="USB";
var SSB_MODE=0x9001; //AFC disable, AVC enable, bandpass&cutoff, 2.2Khz BW
var STEP = 1000;
var BWindex = 3;
var CAP =1;


var BANDS = (STOR.readJSON("bands.json")||[]).filter((e)=>{return e.mod!="AM";});

var BANDSEL = new Selector(BANDS,148,83,(b)=>{STATE = b?3:0;});
var VOLDISP = new BarDisp("Vol:",28,83,VOL,(b)=>{STATE = b?1:0;});
var BRIGHTDISP = new BarDisp("BL :",28,93,BRIGHT,(b)=>{STATE = b?4:0;});
var FREQDISP = new FreqDisp("KHz",20,19,161,28,2,7,TUNEDFREQ/10,(b)=>{STATE = b?2:0;},(f)=>{findBand(f/100);});
var STEPDISP = new StepDisp(90,52,4,(b)=>{STATE = b?5:0;});
var MODSET =  new Button(MOD,0,111,44,23,(b)=>{changeSideBand(b);},12);
var BWSET =  new Button("4.0",49,111,44,23,(b)=>{changeBW(b);},12);
var MUTE = new Button("Mute" ,98,111, 44, 23, (b)=>{RADIO.mute(b);},12);
var ITEMS=[FREQDISP, STEPDISP, VOLDISP,BRIGHTDISP, MODSET, BWSET, MUTE,BANDSEL]; 
    
function setModulation(){
  if (MOD=="SYN") SSB_MODE = SSB_MODE & 0x7fff;
  else SSB_MODE = SSB_MODE | 0x8000;
  RADIO.setProp(0x0101,SSB_MODE);
  MODSET.str=MOD;
  MODSET.reset();
}

function changeSideBand(b){
  if (!b) return;
  MOD = (MOD=="USB")?"LSB":(MOD=="LSB")?"SYN":(MOD=="SYN")?"USB":"USB";
  setModulation(); 
  setTune(TUNEDFREQ,true); //force tune to change side band
}

var stepindex= 2;
const steps =[10,100,1000,10000];


const bwidss =[1.2,2.2,3,4,0.5,1];
function changeBW(b,index){
  if (!b) return;
  if (index) BWindex=index; else BWindex = (BWindex+1)%6;
  var pat = bwidss[BWindex]<2.5 ? BWindex : 0x10 | BWindex;
  SSB_MODE = (SSB_MODE & 0xFF00) | pat;
  RADIO.setProp(0x0101,SSB_MODE);
  BWSET.str = bwidss[BWindex].toFixed(1);
  BWSET.reset();
}

function drawBand() {
  g.setColor(Yellow).setFont('6x8').setFontAlign(-1,-1);
  g.drawString("MIN: "+LOWBAND+"KHz   ",148,62,true);
  g.drawString("MAX: "+HIGHBAND+"KHz   ",148,72,true);
}

function drawSignal(){
  g.setColor(Yellow);
  g.setFont('6x8').setFontAlign(-1,-1).drawString("RSSI: "+RSSI+"   ",0,0,true);
  g.setFontAlign(-1,-1).drawString("SNR : "+SNR+" ",95,0,true);
} 

function setBand(fkhz) {
  if (BANDS.length!=0) {
    var bd = BANDSEL.selected();
    LOWBAND =bd.min;
    HIGHBAND=bd.max;
    if (fkhz) TUNEDFREQ=fkhz*1000; else TUNEDFREQ=bd.freq*1000;
    MOD = bd.mod;
    setModulation();
    CAP= (bd.name=="LOW")?0:1;
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
  FREQDISP.update(f/10);
}

function initRADIO(){
    RADIO.reset();
    RADIO.powerSSB(false);
    if(!RADIO.powerSSB(true)) return false;
    RADIO.setProp(0x0101,SSB_MODE);
    RADIO.volume(VOL);
    return true;
}

function findBand(f){
    var bi = BANDS.findIndex((e)=>{return f<=e.max && f>=e.min;});
    if (bi>=0) {
      BANDSEL.pos=bi;
      BANDSEL.draw(true);
      setBand(f);
    }
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
        if (FREQDISP.edit) 
          FREQDISP.adjust(inc);
         else if (STATE==0) {
           move(inc);
        } else if (STATE==2){
            TUNEDFREQ+=(inc*STEP);
            setTune(TUNEDFREQ);
        } else if(STATE==1) {
            VOL+=inc*4;
            VOL=VOL<0?0:VOL>63?63:VOL;
            VOLDISP.update(VOL);
            RADIO.volume(VOL);
        } else if(STATE==4) {
            BRIGHT+=inc*4;
            BRIGHT=BRIGHT<0?0:BRIGHT>63?63:BRIGHT;
            BRIGHTDISP.update(BRIGHT);
            brightness(BRIGHT/63);
        } else if (STATE==3) {
          BANDSEL.move(inc);
          if (BANDS.length!=0) setBand();
        } else if (STATE==5){
          STEPDISP.move(inc);
          STEP=STEPDISP.step();
        }    
    };
    ROTARY.on("change",ROTARY.handler);  
    BUTTON.on("change",(d)=>{ITEMS[position].toggle(d);});
    BUTTON.on("doubleclick",()=>{if (FREQDISP.focusd) FREQDISP.onDclick();});
}

var s;

function restoreState(){
   s = STOR.readJSON("ssbstate.json",1)||{frequency:5505, volume:32, bright:40, bandwidth:3};
   VOL=s.volume; VOLDISP.update(VOL); RADIO.volume(VOL);
   BRIGHT=s.bright; BRIGHTDISP.update(BRIGHT); brightness(BRIGHT/63);
   changeBW(true,s.bandwidth);
   findBand(s.frequency);
}

function saveState(){
  s.frequency=TUNEDFREQ/1000;
  s.volume=VOL;
  s.bright=BRIGHT;
  s.bandwidth=BWindex;
  STOR.writeJSON("ssbstate.json",s);
}

E.on("kill",saveState);

g.clear().setColor(-1).setFont("Vector",18).drawString("Loading SSB patch ...",10,70);
if (initRADIO()){
  g.clear();
  for (var i=0;i<ITEMS.length;i++) 
    ITEMS[i].focus(i==position);
  g.setColor(Yellow).setFont('6x8').setFontAlign(-1,-1).drawString("MOD",0,102).drawString("BWid",49,102);
  setControls();
  restoreState();
  setInterval(()=>{
    var r = RADIO.getSQ();
    SNR=r.snr; RSSI=r.rssi; STEREO=r.stereo;
    drawSignal();
    g.setFontAlign(-1,-1).drawString("BAT: "+getBattery().toFixed(1)+"V",180,0,true);
  },1000);
} else g.clear().setColor(-1).setFont("Vector",24).drawString("FAILED to load SSB patch",10,70);