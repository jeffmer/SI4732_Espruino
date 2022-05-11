var RADIOI2C = new I2C();
RADIOI2C.setup({scl:D22,sda:D21,bitrate:200000});


var RADIO = {
    delayms:(d) => {
        var t = getTime()+d/1000; while(getTime()<t);
    },
    write:(d) => { 
        RADIOI2C.writeTo(0x63,d);
    }, 
    read:(n) => {
        return RADIOI2C.readFrom(0x63,n); 
    },
    reset:() => {
        D12.set();
        digitalPulse(D12,0,10);
        RADIO.delayms(10);
        
    },
    waitCTS:(d)=>{
      for(var i=0;i<100;i++) if(RADIO.read(1)[0]&0x80) return true;
      return false;
    },
    powerFM:(b)=>{
      if (b) {
        RADIO.write([0x01,0x90,0x05]);  //FM analogue
      } else {
        RADIO.write(0x11);
      }
      RADIO.delayms(500); //stabilisation delay
      return RADIO.waitCTS();
    },
    tune:(f)=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(5);
      cm[0] = 0x20;
      cm[1] = 0x00;
      cm[2] = f>>8;
      cm[3] = f & 0xFF;
      cm[4] = 0;
      RADIO.write(cm);
    },
    endTune:()=>{
      if (!RADIO.waitCTS()) return;
      RADIO.write(0x14);
      var s = RADIO.read(1)[0];
      return (s&1)>0;
    },
    getTuneStatus:()=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(2);
      cm[0] = 0x22;
      cm[1] = 0x01;
      RADIO.write(cm);
      var res = RADIO.read(8);
      return {status:res[0],valid:res[1],freq:(res[2]<<8)+res[3],rssi:res[4],snr:res[5]};
    }, 
    seek:(up,wrap)=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(2);
      cm[0] = 0x21;
      var arg = 0;
      if (up) arg = arg|0x08;
      if (wrap) arg = arg | 0x04;
      cm[1] = arg;
      RADIO.write(cm);
    },
    getSQ:()=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(2);
      cm[0] = 0x23;
      cm[1] = 0x00;
      RADIO.write(cm);
      var res = RADIO.read(8);
      return {status:res[0],valid:res[2],rssi:res[4],snr:res[5]};
    },
    setProp:(id,v)=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(6);
      cm[0] = 0x12;
      cm[1] = 0;
      cm[2] = id>>8;
      cm[3] = id&0xff;
      cm[4] = v>>8;
      cm[5] = v&0xff;
      RADIO.write(cm);
      return RADIO.read(1)[0];
    },
    getProp:(id)=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(4);
      cm[0] = 0x13;
      cm[1] = 0;
      cm[2] = id>>8;
      cm[3] = id&0xff;
      RADIO.write(cm);
      var res = RADIO.read(4);
      return {status:res[0],value:(res[2]<<8)+res[3]};
    },
    volume:(v)=>{RADIO.setProp(0x4000,v<0?0:v>63?63:v);},
    mute:(b)=>{RADIO.setProp(0x4001,b?3:0);}
};