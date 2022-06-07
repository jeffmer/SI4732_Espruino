


class Selector {
    constructor(list,x,y){
        this.list=list;
        this.px=x;
        this.py=y;
        this.pos=0;
        this.buf = Graphics.createArrayBuffer(90,110,2,{msb:true});
        this.pal  = new Uint16Array([0,-1,Grey,Green]);
        this.buf.setFontAlign(0,0).setColor(2).fillRect(0,0,89,109);;
    }

    mod(a,n) {return a>=n?a-n:a<0?a+n:a;}

    draw(b) { 
        this.buf.setColor(0).fillRect({x:0,y:0,x1:89,y2:109,r:10});
        function mod(a,n) {return a>=n?a-n:a<0?a+n:a;}
        for (var i =-2;i<3;i++)
            this.buf.setColor(i==0&&b?1:2).setFont("Vector",18-(i>=0?2*i:2*-i)).drawString(this.list[this.mod(this.pos+i,this.list.length)].station,45,55+20*i);
        g.drawImage({width:90,height:110,bpp:2,palette:this.pal,buffer:this.buf.buffer},this.px,this.py);
    }

    move(inc){
        this.pos=this.mod(this.pos+inc,this.list.length);
        this.draw(true);
    }

    freq(){
        return this.list[this.pos].freq;
    }
}

