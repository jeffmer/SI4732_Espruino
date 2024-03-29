Graphics.prototype.setFontDSEG7ClassicMiniBold = function(scale) {
  // Actual height 28 (27 - 0)
  this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AAVwAQM+AQMfAQMPwEAg/ggEB+AJBnAiOgf/z/+j/w//M/0H/YgBgF/FQQkC/4GX8/An18FIQwC4Y3CT34ACvyTBLYM/wP/w6EB/n/QAQATn5oBgKgBgHPUAMeUAMB8AvBAwP/Ay/n7kAUAPAg6gBbATzBADdAg0Ai0A+EDvEPgF3wHwg4GYn3j8dn+1/yH/x6gB/v/KoIASg//UQS6BgP84AHBQgIHBYoQGaj+cvkD/nP+F/8P/4//bATvU/DvCAwNP8ygkgHh+dgg0/6CGBJgI1BUCkDNAUf+P/5n+5/78CEBv6EBh/wAwP/Ay/gjk+vkATYI2B/7PBUC0f/gdCwAkBNoMOBoRzCQwIGZh18gPw5/gn+B/6gBn/9//gUH4GB8/cvl8FIP3GAXD/+/UCs//EAgLBCp/mgEWQQMDvCJBu+A+EHAzE+8fjs/2v+Q/+PQgKgBWIQALjkB4ByBngGDCAwA='))),
    46,
    atob("AAgXFxcXFxcXFxcXBg=="),
    28+(scale<<8)+(1<<16)
  );
  return this;
};

class FreqDisp {
    constructor(str,x,y,w,fz,d,nd,f,fn,fn2){
      this.x=x; this.y=y; this.w = w; this.fz = fz;
      this.decpoint = d;
      this.str=str; 
      this.f=f;
      this.press=false;
      this.focusd = false;
      this.edit = false;
      this.editDigit=false;
      this.ndigits=nd;
      this.digits = new Array(this.ndigits);
      this.curd = this.ndigits-1;
      this.fn = fn;
      this.fn2 = fn2;
      this.buf = Graphics.createArrayBuffer(w,fz+4,1,{msb:true});
    }

    update(f){
        this.f=f;
        this.buf.clear();
        if (this.edit){
          var lxd = this.w-24-23*this.curd;
          this.buf.drawRect(lxd<0?0:lxd,0,lxd+23,this.fz+3);
          for (var i = 0; i<this.ndigits; ++i) {
              var lx = this.w-24-23*i;
              this.buf.setFont("DSEG7ClassicMiniBold").setFontAlign(-1,-1).drawString(this.digits[i].toString(),lx+1,2);
          }
        } else {
          this.buf.setFont("DSEG7ClassicMiniBold").setFontAlign(1,-1).drawString((this.f).toString(),this.w-1,2);
        }
        if (this.decpoint>0) {
          var dx = this.w-2-23*this.decpoint;
          this.buf.fillRect(dx,25,dx+2,27);
        }
        g.setBgColor(this.focusd?DarkGrey:0).setColor(this.press?-1:Cyan).drawImage(this.buf,this.x,this.y);
        g.setBgColor(0);
      }

    draw(){
        g.setColor(this.press?-1:Cyan).setFont("Vector",14).setFontAlign(-1,1).drawString(this.str,this.x+this.w,this.y+this.fz-4);
        this.update(this.f);
    }

    focus(b){
        this.focusd = b;
        this.draw();
    }
    toggle(b){
      if (b){
      this.press=!this.press;
      this.editDigit = !this.editDigit;
      this.draw();
      } else {
       if (!this.edit) this.fn(this.press);
      }
    }

    startEdit(){
      this.edit=true;
      for (var i=0; i<this.ndigits;++i) this.digits[i]=0;
      this.curd=this.ndigits-1;
      var ac = this.f;
      var d = 0;
      while (ac>=1) {
        this.digits[d]= ac % 10;
        ac = (ac-this.digits[d])/10;
        ++d;
      }
      this.draw();
    }

    endEdit(){
      this.edit=!true;
      var res = 0;
      for (var i=this.ndigits-1; i>=0;--i){
         res = res*10 + this.digits[i];
      }
      this.f = res;
      this.draw();
    }

    onDclick(){
      if (!this.edit)
         this.startEdit();
      else {
         this.endEdit();
         this.fn2(this.f);
      }
    }

    adjust(inc){
      function mod(a,n) {return a>=n?a-n:a<0?a+n:a;}
      if (!this.editDigit){
        this.curd=mod(this.curd+inc,this.ndigits);
      } else {
        this.digits[this.curd]=mod(this.digits[this.curd]+inc,10);
      }
      this.draw();
    }

}


