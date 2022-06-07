var STATNAME = [];

function rdsInit(){
    RADIO.setProp(0x1500,0x0001); // enable receive interrupt
    RADIO.setProp(0x1501,0x0004); // set fifo theshold for interrupt
    RADIO.setProp(0x1502,0xAA01); // set error correction and enable
}

function getname(){
   if (STATNAME.length==4) {
   var S = "";
   STATNAME.forEach(e=>{S=S+e;});
   return S;
   } else return null;
}

function decode(m){
    function cl(c){ c=c&0x7F; return c<32?42:c;}
    var g = (m[6]&0xF0)>>4;
    var s = g==2?String.fromCharCode(cl(m[8]),cl(m[9]),cl(m[10]),cl(m[11])):g==0?String.fromCharCode(cl(m[10]),cl(m[11])):"";
    var o = g==0?m[7]&0x03:m[7]&0x0f;
    if (g==0) STATNAME[o]=s;
    return {group:g,b:(m[6]&0x08)>>3,offset:o,str:s};
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
        if (name) {
          g.setColor(-1).setFont("6x8",2).setFontAlign(-1,-1).drawString(name,20,50,true);
        }
      },1000);
}

function rdsStop(){
    g.setColor(-1).setFont("6x8",2).setFontAlign(-1,-1).drawString("        ",20,50,true);
    if (global.RDSPOLL) global.RDSPOLL=clearInterval(global.RDSPOLL);
}


