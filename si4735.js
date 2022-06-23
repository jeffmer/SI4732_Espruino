//var RADIOI2C = new I2C();
I2C1.setup({scl:D22,sda:D21,bitrate:200000});

var RADIO = {
    isFM:null,
    delayms:(d) => {
        var t = getTime()+d/1000; while(getTime()<t);
    },
    write:(d) => { 
      I2C1.writeTo(0x63,d);
    }, 
    read:(n) => {
        return I2C1.readFrom(0x63,n); 
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
        RADIO.isFM=true;
        RADIO.write([0x01,0x90,0x05]);  //FM analogue
      } else {
        RADIO.write(0x11);
      }
      RADIO.delayms(500); //stabilisation delay
      return RADIO.waitCTS();
    },
    powerAM:(b)=>{
      if (b) {
        RADIO.isFM=false;
        RADIO.write([0x01,0x91,0x05]);  //AM analogue
      } else {
        RADIO.write(0x11);
      }
      RADIO.delayms(500); //stabilisation delay
      return RADIO.waitCTS();
    },
    powerSSB:(b)=>{
      if (b) {
        RADIO.isFM=false;
        RADIO.write([0x01,0x91,0x05]);  //AM patch analogue
        var nb = SSB.lenPatch();
        var next = 0;
        while(next<nb) {
          RADIO.write(SSB.getPatch(next,8));
          next+=8;
        }
        if (next!=nb) return false;
      } else {
        RADIO.write(0x11);
      }
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
    tuneAM:(f,sw)=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(6);
      cm[0] = 0x40;
      cm[1] = 0x00;
      cm[2] = f>>8;
      cm[3] = f & 0xFF;
      cm[4] = 0;
      cm[5] = sw?1:0;
      RADIO.write(cm);
    },
    tuneSSB:(f,sw,usb)=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(6);
      cm[0] = 0x40;
      cm[1] = usb?0x80:0x40;
      cm[2] = f>>8;
      cm[3] = f & 0xFF;
      cm[4] = 0;
      cm[5] = sw?1:0;
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
      cm[0] = RADIO.isFM?0x22:0x42;
      cm[1] = 0x01;
      RADIO.write(cm);
      var res = RADIO.read(8);
      return {status:res[0],valid:res[1],freq:(res[2]<<8)+res[3],rssi:res[4],snr:res[5]};
    }, 
    seek:(up,wrap)=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(2);
      cm[0] = RADIO.isFM?0x21:0x41;
      var arg = 0;
      if (up) arg = arg|0x08;
      if (wrap) arg = arg | 0x04;
      cm[1] = arg;
      RADIO.write(cm);
    },
    getSQ:()=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(2);
      cm[0] = RADIO.isFM?0x23:0x43;
      cm[1] = 0x00;
      RADIO.write(cm);
      var res = RADIO.read(RADIO.isFM?8:6);
      return {status:res[0],valid:res[2],stereo:res[3]>>7,rssi:res[4],snr:res[5]};
    },
    setAGC:(enable,val)=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(3);
      cm[0] = 0x48;
      cm[1] = enable?0:1;
      cm[2] = val;
      RADIO.write(cm);
    },
    getRDS:()=>{
      if (!RADIO.waitCTS()) return;
      var cm = new Uint8Array(2);
      cm[0] = 0x24;
      cm[1] = 0x01;
      RADIO.write(cm);
      var res = RADIO.read(13);
      return res;
    },
    hasRDS:()=>{
      if (!RADIO.waitCTS()) return;
      RADIO.write(0x14);
      var s = RADIO.read(1)[0];
      return (s&4)>0;
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