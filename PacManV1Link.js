framerate = 60;
void setup() 
{
    var w=this.param("width");
    var h=this.param("height");
    size(w,h);
    framerate=60;
};


/**********************************************************************
The draw function from KA called appox 60 times per second
**********************************************************************/
void draw()
{
    background(0, 0, 0);
    PlayPacManGame().run();
};

// EOF ****************************************************************

