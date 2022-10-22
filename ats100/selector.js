


class Selector {
    constructor(list,x,y,fn){
        this.list=list;
        this.px=x;
        this.py=y;
        this.pos=0;
        this.buf = Graphics.createArrayBuffer(90,50,2,{msb:true});
        this.pal  = new Uint16Array([Blue,-1,Grey,Green]);
        this.buf.setFontAlign(0,0).setColor(2).fillRect(0,0,89,109);
        this.focusd = false;
        this.fn = fn;
        this.press = false;
    }

    mod(a,n) {return a>=n?a-n:a<0?a+n:a;}

    draw() { 
        this.buf.setColor(this.press?3:0).fillRect(0,0,89,49);
        if (this.focusd) this.buf.setColor(1).drawRect(0,0,89,49);
        function mod(a,n) {return a>=n?a-n:a<0?a+n:a;}
        var len = this.list.length;
        if (len!=0){
            var bound = len>=3?1:0;
            for (var i =-bound;i<=bound;i++)
                this.buf.setColor(i==0?1:2).setFont("Vector",14).drawString(this.list[mod(this.pos+i,len)].name,45,25+16*i);
        }
        g.drawImage({width:90,height:50,bpp:2,palette:this.pal,buffer:this.buf.buffer},this.px,this.py);
    }

    focus(b){
        this.focusd = b;
        this.draw();
    }
    toggle(){
        this.press=!this.press;
        this.draw();
        this.fn(this.press);
      }
    move(inc){
        if (this.list.length==0) return;
        this.pos=this.mod(this.pos+inc,this.list.length);
        this.draw(true);
    }

    freq(){
        return this.list[this.pos].freq;
    }

    selected(){
        return this.list[this.pos];
    }

    add(newname,f){
        if (this.list.length!=0 && newname==this.list[this.pos].name) return;
        this.list.splice(this.pos,0,{name:newname,freq:f});
    }

    del(){
        if(this.list.length==0) return;
        this.list.splice(this.pos,1);
        if (this.pos==this.list.length) --this.pos;
        if (this.pos<0) this.pos=0;
    }

}

