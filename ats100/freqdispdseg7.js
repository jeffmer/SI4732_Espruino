Graphics.prototype.setFontDSEG7ClassicMiniBold = function(scale) {
  // Actual height 28 (27 - 0)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AAVwAQM+AQMfAQMPwEAg/ggEB+AJBnAiOgf/z/+j/w//M/0H/YgBgF/FQQkC/4GX8/An18FIQwC4Y3CT34ACvyTBLYM/wP/w6EB/n/QAQATn5oBgKgBgHPUAMeUAMB8AvBAwP/Ay/n7kAUAPAg6gBbATzBADdAg0Ai0A+EDvEPgF3wHwg4GYn3j8dn+1/yH/x6gB/v/KoIASg//UQS6BgP84AHBQgIHBYoQGaj+cvkD/nP+F/8P/4//bATvU/DvCAwNP8ygkgHh+dgg0/6CGBJgI1BUCkDNAUf+P/5n+5/78CEBv6EBh/wAwP/Ay/gjk+vkATYI2B/7PBUC0f/gdCwAkBNoMOBoRzCQwIGZh18gPw5/gn+B/6gBn/9//gUH4GB8/cvl8FIP3GAXD/+/UCs//EAgLBCp/mgEWQQMDvCJBu+A+EHAzE+8fjs/2v+Q/+PQgKgBWIQALjkB4ByBngGDCAwA='))),
    46,
    atob("AAgXFxcXFxcXFxcXBg=="),
    28+(scale<<8)+(1<<16)
  );
  return this;
}



class FreqDisp {
    constructor(str,x,y,w,fz,f,fn){
      this.x=x; this.y=y; this.w = w; this.fz = fz;
      this.str=str; 
      this.f=f;
      this.press=false;
      this.focusd = false;
      this.press = false;
      this.fn = fn;
      this.buf = Graphics.createArrayBuffer(w,fz+2,1,{msb:true});
    }

    update(f){
        this.f=f;
        this.buf.clear();
        this.buf.setFont("DSEG7ClassicMiniBold").setFontAlign(1,-1).drawString((f/100).toFixed(1),this.w-1,0).fillRect(this.w-25,25,this.w-23,27) ;
        g.setColor(this.press?-1:Cyan).drawImage(this.buf,this.x,this.y);
      }

    draw(){
        g.setColor(this.press?-1:Cyan).setFont("Vector",14).setFontAlign(-1,1).drawString(this.str,this.x+this.w,this.y+this.fz-4);
        this.update(this.f);
        g.setColor(this.focusd?Cyan:0).drawLine(this.x,this.y+this.fz+2,this.x+this.w,this.y+this.fz+2);
    }

    focus(b){
        this.focusd = b;
        this.draw();
    }
    toggle(b){
      if (b){
      this.press=!this.press;
      this.draw();
      } else {
       this.fn(this.press);
      }
    }
}
