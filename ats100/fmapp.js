eval(STOR.read("selector.js"));
eval(STOR.read("button.js"));
eval(STOR.read("bardisp.js"));
eval(STOR.read("freqdisp.js"));
eval(STOR.read("rds.js"));

var STATE=0;  //0 = SELECT, 1 = VOL, 2= FREQ, 3 = STATION, 4 = BRIGHTNESS
var VOL=32;
var BRIGHT=40;
var SCREENSAVE=120;
var FREQ=9580;
var RSSI =0;
var SNR =0;
var STEREO=0;
var LOWBAND = 8750;
var HIGHBAND = 10790;

  var STATIONS = STOR.readJSON("stations.json")||[];
  STATIONS.sort((a,b)=>{
    if(a.name<b.name)return -1;
    if(a.name>b.name)return 1;
    return 0;
  });

var STATSEL = new Selector(STATIONS,148,83,(b)=>{STATE = b?3:0;});
var VOLDISP = new BarDisp("Vol:",28,72,VOL,(b)=>{STATE = b?1:0;});
var BRIGHTDISP = new BarDisp("Bright:",170,72,BRIGHT,(b)=>{STATE = b?4:0;});
var FREQDISP = new FreqDisp("MHz",110,19,92,28,1,4,FREQ/10,(b)=>{STATE = b?2:0;},(f)=>{setTune(f*10);});
var SCANUP = new Button("Scan+",0,  83, 44, 23, ()=>{scan(true,SCANUP,SCANDOWN);},12);
var SCANDOWN = new Button("Scan-",49, 83, 44, 23, ()=>{scan(false,SCANDOWN,SCANUP);},12);
var ADDSTAT =  new Button("Add",  98,83, 44, 23,(b)=>{addStation(b);},12);
var DELSTAT =  new Button("Del",  98,111, 44, 23,(b)=>{delStation(b);},12);
var ITEMS=[
    FREQDISP, VOLDISP,BRIGHTDISP, SCANUP, SCANDOWN,  ADDSTAT, STATSEL, DELSTAT,
    new Button("Mute" ,49,111, 44, 23, (b)=>{RADIO.mute(b);},12),
    new Button("RDS",  0, 111, 44, 23, (b)=>{if (b) rdsStart(); else rdsStop();},12),  
]; 

function addStation(b){
    if(b && SEGMENTS==15) {
      STATSEL.add(getname(),FREQ);
      STATSEL.draw(1);
      STOR.writeJSON("stations.json",STATIONS);
    }
    ADDSTAT.reset();
  }
  
  function delStation(b){
    if(b && DELSTAT.press) {
      STATSEL.del();
      STATSEL.draw(1);
      if (STATIONS.length!=0) setTune(STATSEL.freq());
      STOR.writeJSON("stations.json",STATIONS);
    }
    DELSTAT.reset();
  }
  
function drawSignal(){
    g.setColor(Yellow);
    g.setFont('6x8').setFontAlign(-1,-1).drawString("RSSI: "+RSSI+"   ",0,0,true);
    g.setFontAlign(0,-1).drawString(STEREO==1?"Stereo":"      ",120,0,true);
    g.setFontAlign(-1,-1).drawString("SNR : "+SNR+" ",0,10,true);
} 

function setTune(f){
    f = f<LOWBAND?LOWBAND:f>HIGHBAND?HIGHBAND:f;
    RADIO.tune(f);
    rdsClear();
    while(!RADIO.endTune());
    var r= RADIO.getTuneStatus();
    FREQ=r.freq; SNR=r.snr; RSSI=r.rssi;
    FREQDISP.update(FREQ/10);
    drawSignal();
  }
  
  var SCANNER=null;
  
  function scan(up,thisone,other){
    if (SCANNER) SCANNER=clearInterval(SCANNER);
    if(other.press){other.reset();}
    rdsClear();
    RADIO.seek(up,false);
    SCANNER=setInterval(()=>{
        if (!RADIO.endTune()) return;
        if (SCANNER) SCANNER=clearInterval(SCANNER);
        var r=RADIO.getTuneStatus();
        FREQ=r.freq; SNR=r.snr; RSSI=r.rssi;
        FREQDISP.update(FREQ/10); drawSignal();
        thisone.reset();
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
        else if (STATE==0) {
           move(inc);
        } else if (STATE==2){
             FREQ+=(inc*10);
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
           STATSEL.move(inc);
           if (STATIONS.length!=0) setTune(STATSEL.freq());
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

function findStation(f){
  var bi = STATIONS.findIndex((e)=>{return f==e.freq;});
  if (bi>=0) {
    STATSEL.pos=bi;
    STATSEL.draw();
  }
  setTune(f);
}

function restoreState(){
   s = STOR.readJSON("fmstate.json",1)||{frequency:9540, volume:32, bright:40};
   VOL=s.volume; VOLDISP.update(VOL); RADIO.volume(VOL);
   BRIGHT=s.bright; BRIGHTDISP.update(BRIGHT); brightness(BRIGHT/63);
   findStation(s.frequency);
}

function saveState(){
  s.frequency=FREQ;
  s.volume=VOL;
  s.bright=BRIGHT;
  STOR.writeJSON("fmstate.json",s);
}

E.on("kill",saveState);

g.clear();
for (var i=0;i<ITEMS.length;i++) 
  ITEMS[i].focus(i==position);
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