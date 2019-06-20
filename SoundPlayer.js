/*******************************************************************************************
SoundPlayer is a small library to make playing sounds in JS easier
Author: Dennis Bingaman (ddbtech@hughes.net)
http://www.theunseenrock.com
*******************************************************************************************/

/*******************************************************************************************
Source for this code: https://www.w3schools.com/graphics/game_sound.asp
You can use this directly or use the sound manager.  Using this directly is more efficent
but increases the complexity of your code.  (tradeoff).  In life everything has its price.
usage: var mySound=new Sound("mysoundFile.jpg");
then:
    mySound.play(); // To play the sound
    mySound.stop(); // To stop playing the sound
*******************************************************************************************/
function Sound(src) 
{
    this.name=src;
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function()
    {
      this.sound.play();
    }
    this.stop = function()
    {
      this.sound.pause();
    }
  }

/*******************************************************************************************
I added a sound manager so the user would not have to go around creating lots of sound
objects.  Here you just create a soundmanager object.  Then you call play to play any
sound file you wish.  It gets added to the sound manager for future use.
There is a small efficiency price in that it must find it in the array
Usage:
  var gameSound=new SoundManager();
  gameSound.play("mySound.jpg");
*******************************************************************************************/
function SoundManager()
  {
      this.sounds=[];

      /************************************************************************************
      Plays a specific mp3 sound file
      ************************************************************************************/
      this.play=function(name)
      {
        var s=this.sounds.find(k=>k.name===name);
        if(s===undefined)
        {
            this.sounds.push(new Sound(name));    
            s=this.sounds.find(k=>k.name===name);
        }
        s.play();
      }

      /************************************************************************************
      Stops playing a specifiy mp3 sound file
      ************************************************************************************/
     this.stop=function(name)
      {
        var s=this.sounds.find(k=>k.name===name);
        if(s===undefined)
        {
            this.sounds.push(new Sound(name));    
            s=this.sounds.find(k=>k.name===name);
        }
        s.stop();
      }
  }

  // EOF ********************************************************************************
  