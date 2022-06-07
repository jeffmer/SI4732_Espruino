var STATNAME = new Uint8Array(8);
var SEGMENTS  = 0;

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
  if (s) g.setColor(-1).setFont("6x8",2).setFontAlign(-1,-1).drawString(s,20,40,true);
}

function decode(m){
    function cl(c){ c=c&0x7F; return c<32?42:c;}
    var g = (m[6]&0xF0)>>4;
    var o = g==0?m[7]&0x03:m[7]&0x0f;
    if (g==0){
      STATNAME[2*o]=cl(m[10]);
      STATNAME[2*o+1]=cl(m[11]);
      SEGMENTS=SEGMENTS|(1<<o);
    }
    return {group:g,b:(m[6]&0x08)>>3,offset:o};
}
  
function rdsStart(){
    rdsInit();
    global.RDSPOLL = setInterval(()=>{
        if(RADIO.hasRDS()){
        while (true) {
          var dd = RADIO.getRDS();  
          if (dd[3]==0) break;
          var stat = decode(dd);
          //if (stat.group==0) console.log(stat,S); 
        }
      }
      var name = getname(); 
      drawStation(name);
      },1000);
}

function rdsClear(){
  SEGMENTS=0;
  drawStation("        ");
}

function rdsStop(){
    rdsClear();
    if (global.RDSPOLL) global.RDSPOLL=clearInterval(global.RDSPOLL);
}


