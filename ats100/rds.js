var STATNAME = new Uint8Array(8);
var SEGMENTS  = 0;
var RDSMSG = new Uint8Array(64);
var AB = 0;

function clearMsg(){
  for(var i=0;i<RDSMSG.length;i++) RDSMSG[i]=0;
}

function getMsg(){
  var end = RDSMSG.findIndex((e)=>{return e==0 || e==42});
  end = end<0?63:end;
  if (end <8) return null;
  return end<63 ? E.toString(RDSMSG.subarray(0,end)): E.toString(RDSMSG);
}

function rdsInit(){
    RADIO.setProp(0x1500,0x0001); // enable receive interrupt
    RADIO.setProp(0x1501,0x0004); // set fifo theshold for interrupt
    RADIO.setProp(0x1502,0xAA01); // set error correction and enable
}

function getname(){
   if (SEGMENTS==15) {
     return E.toString(STATNAME);
   } else return null;
}

function drawStation(s){
  if (s) g.setColor(-1).setFont("6x8",2).setFontAlign(-1,-1).drawString(s,0,30,true);
}

var rdsbuf = Graphics.createArrayBuffer(220,20,1,{msb:true});
rdsbuf.setFont("6x8",1).setFontAlign(-1,-1);

function drawMsg(msg){
  rdsbuf.clear();
  if (msg) msg= rdsbuf.drawString(rdsbuf.wrapString(msg, rdsbuf.getWidth()).join("\n"),0,0);
  g.setColor(-1).drawImage(rdsbuf,0,50);
}

function decode(m){
    function cl(c){ c=c&0x7F; return c<32?42:c;}
    var g = (m[6]&0xF0)>>4;
    var b0 = (m[6]&0x08)>>3;
    var o = g==0?m[7]&0x03:m[7]&0x0f;
    if (g==2) {
      var ab = (m[7]&0x10)>>4; 
      if (ab!=AB) {AB=ab; clearMsg();}
    }
    if (g==0){
      STATNAME[2*o]=cl(m[10]);
      STATNAME[2*o+1]=cl(m[11]);
      SEGMENTS=SEGMENTS|(1<<o);
    } else if (g==2 ) {
      if (b0){
        RDSMSG[2*o]=cl(m[10]);
        RDSMSG[2*o+1]=cl(m[11]);
      } else {
        RDSMSG[4*o]=cl(m[8]);
        RDSMSG[4*o+1]=cl(m[9]);
        RDSMSG[4*o+2]=cl(m[10]);
        RDSMSG[4*o+3]=cl(m[11]);
      }
    }
}
  
function rdsStart(){
    rdsInit();
    global.RDSPOLL = setInterval(()=>{
        if(RADIO.hasRDS()){
        while (true) {
          var dd = RADIO.getRDS();  
          if (dd[3]==0) break;
          decode(dd);
        }
      }
      var name = getname(); 
      drawStation(name);
      var msg = getMsg();
      drawMsg(msg);
      },1000);
}

function rdsClear(){
  SEGMENTS=0;
  clearMsg();
  drawMsg(null);
  drawStation("        ");
}

function rdsStop(){
    rdsClear();
    if (global.RDSPOLL) global.RDSPOLL=clearInterval(global.RDSPOLL);
}


