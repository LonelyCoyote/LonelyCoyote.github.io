/**********************************************************************
Create the original PacMan arcade game
(yea, I know: it's been done a million times :)
Author: Dennis Bingaman
Design Goals:
We will have three scenes
1 - The startup screen for the game
2 - The game screen while playing
3 - The end of the game with the score

The startup screen will have an icon of PacMan along with a start
button

The play screen will be just like the original PacMan screen.
The only input allowed from the user is the arrow keys
When an arrow key is pressed the pac man will move in that direction
when he gets to a wall in the scene, in other words
the cursur key pressed is 'remembered' so the user can change the 
direction ahead of time

Points are ammassed as the user plays the game.  If the user manages
to make it to the next level he gets another life, unless he already
has 5 lives in which case he does not.

Eating ghost gains extra points.  On higher levels you gain
points faster.

Special Thanks To:

Larry Serflaten:
who provided constructive feedback on the game.
He mentioned the code may be overly complicated, he may be right.
He also provided some feedback on how to properly handle read only
variables and other JS advanced topic help.
Thanks Larry!

Bugs Found:
Lary Serflaten: Intermittently PacMan gets past a ghost
Status: Fixed (I think).  Need more testing.

Changes:
2019.06.17 - Ghosts now slow down when vulnerable to being eaten
             to 70% normal speed
2019.06.17 - When ghost become vulnerable they switch directions
2019.06.18 - Default game starting speed increased by 30%

Thanks to others for feedback.
(Possible others here)
**********************************************************************/

/**********************************************************************
As in all the games I create there is one object that holds the
game and allows interaction, all code for the game is in here
**********************************************************************/
var PacManGame=function()
{
    var width=800;
    var height=800;
    var startingGameSpeed=1.3*width/400;
    var gameSpeed=startingGameSpeed;
    var gameSounds=new SoundManager();

    /******************************************************************
    The size of the grid (we must use closures to make constants)
    ******************************************************************/
    var gridSize=function(){return 25;};
    
    /******************************************************************
    Pixel size of a tile
    ******************************************************************/
    var tileSize=(function()
    {
        var tileSize=width/gridSize();
        var retval=function(){return tileSize;};
        return retval;
    })();

    /******************************************************************
    Allows for a mouse press and release action to be detected
    regardless of how slow it might happen
    ******************************************************************/
    var mouseWasClicked=(function()
    {
        var wasClicked=false;
        var retval=function()
        {
            if(wasClicked===false && mousePressed && mouseButton===LEFT)
            {
                wasClicked=true;
                return false;
            }
            if(wasClicked===true && !mousePressed)
            {
                wasClicked=false;
                return true;
            }
            return false;
        };
        return retval;
    })();
    
    /******************************************************************
    A grid object is a stationary object that remains on the grid
    and does not move.  This would be the parts that make up the maze,
    the food the PacMan eats and the larger food that allows him to 
    eat the ghust along with empty grid space PacMan can move through
    gridX : xcordinate of the object valid: 0 to 24
    grddY : ycordinate of the object valid: 0 to 24
    ******************************************************************/
    var GridObject=function(gridX,gridY)
    {
        this.gridX=gridX;
        this.gridY=gridY;
        
        // Indicates ghost and the PacMan cannot pass through 
        // the object, for pass through objects this is set to false
        this.barrier=true;  
        
        // The pixel center of the tile
        this.x=tileSize()/2+tileSize()*this.gridX;
        this.y=tileSize()/2+tileSize()*this.gridY;
    };
    
    /******************************************************************
    A vertical wall component part
    ******************************************************************/
    var VerticalWallPart=function(gridX,gridY)
    {
        GridObject.call(this,gridX,gridY);
        VerticalWallPart.prototype.draw= function() 
        {
            var wallWidth=tileSize()/3;
            var wallHeigth=tileSize();
            noStroke();
            fill(0,0,255);
            rectMode(CENTER);
            rect(this.x,this.y,wallWidth,wallHeigth);
        };
    };
    VerticalWallPart.prototype=new GridObject();

    /******************************************************************
    Top left wall part
    ******************************************************************/
    var TopLeftWallPart=function(gridX,gridY)
    {
        GridObject.call(this,gridX,gridY);
        TopLeftWallPart.prototype.draw= function() 
        {
            var wallWidth=tileSize()/3;
            var wallHeigth=tileSize();
            noStroke();
            fill(0,0,255);
            
            pushMatrix();
            // Note: these adjustment factors where arrived at
            // experimentally to make a nice corner
            translate(tileSize()/2,tileSize()/2);
            arc(this.x,this.y,3*tileSize()/2.2,3*tileSize()/2.2,radians(180),radians(270));
            fill(0, 0, 0);
            arc(this.x,this.y,tileSize()/1.5,tileSize()/1.5,radians(180),radians(270));
            popMatrix();
        };
    };
    TopLeftWallPart.prototype=new GridObject();

    /******************************************************************
    Top right wall part
    ******************************************************************/
    var TopRightWallPart=function(gridX,gridY)
    {
        GridObject.call(this,gridX,gridY);
        TopRightWallPart.prototype.draw= function() 
        {
            var wallWidth=tileSize()/3;
            var wallHeigth=tileSize();
            noStroke();
            fill(0,0,255);
            
            pushMatrix();
            // Note: these adjustment factors where arrived at
            // experimentally to make a nice corner
            translate(-tileSize()/1.95,tileSize()/2);
            arc(this.x,this.y,3*tileSize()/2.2,3*tileSize()/2.2,radians(270),radians(359.99));
            fill(0, 0, 0);
            arc(this.x,this.y,tileSize()/1.5,tileSize()/1.5,radians(270),radians(359.99));
            popMatrix();
        };
    };
    TopRightWallPart.prototype=new GridObject();

    /******************************************************************
    bottom right wall part
    ******************************************************************/
    var BottomRightWallPart=function(gridX,gridY)
    {
        GridObject.call(this,gridX,gridY);
        BottomRightWallPart.prototype.draw= function() 
        {
            var wallWidth=tileSize()/3;
            var wallHeigth=tileSize();
            noStroke();
            fill(0,0,255);
            
            pushMatrix();
            // Note: these adjustment factors where arrived at
            // experimentally to make a nice corner
            translate(-tileSize()/1.9,-tileSize()/1.9);
            arc(this.x,this.y,3*tileSize()/2.2,3*tileSize()/2.2,0,radians(90));
            fill(0, 0, 0);
            arc(this.x,this.y,tileSize()/1.4,tileSize()/1.4,0,radians(90));
            popMatrix();
        };
    };
    BottomRightWallPart.prototype=new GridObject();

    /******************************************************************
    bottom left wall part
    ******************************************************************/
    var BottomLeftWallPart=function(gridX,gridY)
    {
        GridObject.call(this,gridX,gridY);
        BottomLeftWallPart.prototype.draw= function() 
        {
            var wallWidth=tileSize()/3;
            var wallHeigth=tileSize();
            noStroke();
            fill(0,0,255);
            
            pushMatrix();
            // Note: these adjustment factors where arrived at
            // experimentally to make a nice corner
            translate(tileSize()/2,-tileSize()/1.9);
            arc(this.x,this.y,3*tileSize()/2.2,3*tileSize()/2.2,radians(90),radians(180));
            fill(0, 0, 0);
            arc(this.x,this.y,tileSize()/1.4,tileSize()/1.4,radians(90),radians(180));
            popMatrix();
        };
    };
    BottomLeftWallPart.prototype=new GridObject();

    /******************************************************************
    A horizontal wall component part
    ******************************************************************/
    var HorizontalWallPart=function(gridX,gridY)
    {
        GridObject.call(this,gridX,gridY);
        HorizontalWallPart.prototype.draw= function() 
        {
            var wallWidth=tileSize();
            var wallHeigth=tileSize()/3;
            noStroke();
            fill(0,0,255);
            rectMode(CENTER);
            rect(this.x,this.y,wallWidth,wallHeigth);
        };
    };
    HorizontalWallPart.prototype=new GridObject();

    /******************************************************************
    Empty Grid Object (draw nothing in this spot)
    ******************************************************************/
    var EmptyGridObject=function(gridX,gridY)
    {
        GridObject.call(this,gridX,gridY);
        this.barrier=false;
        EmptyGridObject.prototype.draw= function() {/*do nothing*/};
    };
    EmptyGridObject.prototype=new GridObject();
    
    /******************************************************************
    Food pelets gain you points
    *****************************************************************/
    var FoodPellet=function(gridX,gridY)
    {
        GridObject.call(this,gridX,gridY);
        this.barrier=false; // a food pellet is not a barrier
        this.isEaten=false; // PacMan eats them this gets set true
        this.isPowerFoodPellet=false;
        FoodPellet.prototype.draw= function() 
        {
            // nothing to draw if eaten
            if(this.isEaten){return;}    
            fill(255,255,255);
            noStroke();
            var pelletSize=tileSize()/6;
            ellipseMode(CENTER);
            ellipse(this.x,this.y,pelletSize,pelletSize);
        };
    };
    FoodPellet.prototype=new GridObject();
    
    /******************************************************************
    Power pellets turn the ghust blue and you can eat them!
    For a little while that is.
    *****************************************************************/
    var PowerFoodPellet=function(gridX,gridY)
    {
        GridObject.call(this,gridX,gridY);
        this.barrier=false; // a power food pellet is not a barrier
        this.isEaten=false;
        this.isPowerFoodPellet=true;
        
        PowerFoodPellet.prototype.draw= function()
        {            
            // nothing to draw if eaten
            if(this.isEaten){return;}
            fill(255,255,255);
            noStroke();
            var powerPelletSize=tileSize()/2;
            ellipseMode(CENTER);
            ellipse(this.x,this.y,powerPelletSize,powerPelletSize);
        };
    };
    PowerFoodPellet.prototype=new GridObject();
    
    /******************************************************************
    Returns a grid component appropriate with a given char
    The builds the scene
    c : the char that determines the type of component
    gridX: the x grid position
    gridY: the y grid positioin
    ******************************************************************/
    var getGridComponent=function(c,gridX,gridY)
    {
        switch(c)
        {
            case " ":   return new EmptyGridObject(gridX,gridY);
            case "1":   return new TopLeftWallPart(gridX,gridY);
            case "2":   return new TopRightWallPart(gridX,gridY);
            case "3":   return new BottomRightWallPart(gridX,gridY);
            case "4":   return new BottomLeftWallPart(gridX,gridY);
            case "|":   return new VerticalWallPart(gridX,gridY);
            case "-":   return new HorizontalWallPart(gridX,gridY);
            case ".":   return new FoodPellet(gridX,gridY);
            case "*":   return new PowerFoodPellet(gridX,gridY);
            
            default:
            return new GridObject(gridX,gridY);
        }
    };

    /******************************************************************
    The basic parts of the game lay on a grid pattern for this
    reason it might be easiest to use a simple character array to
    represent the different parts of the game pattern
    1 : a top left corner
    2 : a top right corner
    3 : a bottom right corner
    4 : a bottom left corner
    | : a vertical wall component
    - : a horizontal wall component
    space : just empty
    . : a spot where a dot may be eaten
    * : a large dot that makes the ghost turn blue and you may eat them
    We will use a 25x25 matrix, this makes each block:
    400/25=16 pixels high and wide
    ******************************************************************/
    var gameTemplate=(function()
    {
        var matrix=[
            "1----------2 1----------2",
            "|..........| |..........|",
            "|.1-2.1--2.| |.1--2.1-2.|",
            "|*| |.|  |.| |.|  |.| |*|",
            "|.4-3.4--3.4-3.4--3.4-3.|",
            "|.......................|",
            "|.12.12.1-------2.12.12.|",
            "|.||.||.4--2 1--3.||.||.|",
            "|.||.||....| |....||.||.|",
            "|.||.|4--2 | | 1--3|.||.|",
            "|.||.|1--3 4-3 4--2|.||.|",
            "|.||.|42         13|.||.|",
            "|.43.| | 1-- --2 | |.43.|",
            "|....| | |     | | |....|",
            "|.12.| | 4-- --3 | |.12.|",
            "|.||.4-3         4-3.||.|",
            "|.||.....1-----2.....||.|",
            "|.|4---2.|     |.1---3|.|",
            "|.4---2|.|     |.|1---3.|",
            "|.....43.4-----3.43.....|",
            "|*1-2...............1-2*|",
            "|.| |.1----2.1----2.| |.|",
            "|.4-3.4----3.4----3.4-3.|",
            "|.......................|",
            "4-----------------------3",
            ];
        // Add code to this function to return an actual
        // array of objects created from the template
        var tiles=[];
        for(var y=0;y<matrix.length;y++)
        {
            for(var x=0;x<matrix[y].length;x++)
            {
                tiles.push(getGridComponent(matrix[y][x],x,y));
            }
        }
        var retval=function(){return tiles;};
        return retval;
    })();
    
    
    /******************************************************************
    Return the total number of pellets in the game
    ******************************************************************/
    var totalPelletCount=(function()
    {
        var totalPelletCount=0;
        for(var x=0;x<gameTemplate().length;x++)
        {
            if(gameTemplate()[x].isEaten!==undefined)
            {
                totalPelletCount++;
            }
        }
        var retval=function(){return totalPelletCount;};
        return retval;
    })();
    var pelletCount=totalPelletCount();

    /******************************************************************
    Constants to represent moves
    For the PacMan this comes from commands from the keyboard
    For the Ghost this represents which way the ghost wants to move
    while going though the maze
    ******************************************************************/
    var NEXT_MOVE={
        NONE:0,
        UP:1,
        RIGHT:2,
        DOWN:3,
        LEFT:4
    };

    /******************************************************************
    0 : no last key pressed
    1 : up key pressed
    2 : right key pressed
    3 : down key pressed
    4 : left key pressed
    reset : pass in nothing or false, to retain last key.  pass
    in true to reset to no key pressed
    ******************************************************************/
    var getLastCommandedMoveFromUser=(function(reset)
    {
        var move=NEXT_MOVE.NONE;
        var retval=function(reset)
        {
            if(reset!==undefined)
            {
                move=NEXT_MOVE.NONE; 
                return NEXT_MOVE.NONE;
            }
            if(keyPressed)
            {
                if(keyCode===UP){move=NEXT_MOVE.UP;}
                if(keyCode===RIGHT){move=NEXT_MOVE.RIGHT;}
                if(keyCode===DOWN){move=NEXT_MOVE.DOWN;}
                if(keyCode===LEFT){move=NEXT_MOVE.LEFT;}
            }
            return move;
        };
        return retval;
    })();
    
    /******************************************************************
    ******************************************************************/
    var getGridObject=function(gridX,gridY)
    {
        var index=gridX+gridY*gridSize();
        return gameTemplate()[index];
    };
    
    /******************************************************************
    ******************************************************************/
    var getGridObjectWithXYPosition=function(x,y)
    {
        var gridPos=getGridObjectXYPosition(x,y);
        return getGridObject(gridPos.x,gridPos.y);
    };
    
    /******************************************************************
    ******************************************************************/
    var getGridObjectXYPosition=function(x,y)
    {
        // round instead of floor causes a complete lockup!
        var gridX=floor(x/tileSize());
        var gridY=floor(y/tileSize());
        return new PVector(gridX,gridY);
    };
    
    /******************************************************************
    PacMan and the ghost share come common functionality
    Base object for PacMan and Ghost
    ******************************************************************/
    var MovingObject=function(gridX,gridY)
    {
        this.resetx=tileSize()/2+tileSize()*gridX;
        this.resety=tileSize()/2+tileSize()*gridY;
        
        this.x=this.resetx;
        this.y=this.resety;
        this.speed=gameSpeed;   // This speed increases on higher levels
        
        this.movingUp=false;
        this.movingDown=false;
        this.movingRight=false;
        this.movingLeft=true;

        /**************************************************************
        This is required when we change paths, we must stay directly
        on the assigned paths for any moving object
        **************************************************************/
        MovingObject.prototype.allignWithGrid=function()
        {
            var pos=getGridObjectXYPosition(this.x,this.y);
            this.x=tileSize()/2+tileSize()*pos.x;
            this.y=tileSize()/2+tileSize()*pos.y;
        };
        
        /**************************************************************
        Direction is a string, it can be 'UP' 'DOWN' 'LEFT' or 'RIGHT'
        **************************************************************/
        MovingObject.prototype.setDirection=function(direction)
        {
            this.movingUp=false;
            this.movingDown=false;
            this.movingRight=false;
            this.movingLeft=false;
            switch(direction)
            {
                case 'UP': this.movingUp=true;
                    break;
                case 'DOWN': this.movingDown=true;
                    break;
                case 'RIGHT': this.movingRight=true;
                    break;
                default: this.movingLeft=true;
            }
        };

        /*************************************************************
        When starting a new round of pacman moving objects need
        reset
        *************************************************************/
        MovingObject.prototype.reset=function()
        {
            this.x=this.resetx;
            this.y=this.resety;
            this.movingUp=false;
            this.movingDown=false;
            this.movingRight=false;
            this.movingLeft=true;
            this.speed=gameSpeed;
        };
        
        /*************************************************************
        We will always be overlapping on grid locations.  
        We need to know what grid object we are on to 
        *************************************************************/
        /*************************************************************
        *************************************************************/
        MovingObject.prototype.enteringLeftTileBarrier=function()
        {
            var x=this.x-tileSize()/2.01;
            var leftTile=getGridObjectWithXYPosition(x,this.y);
            return leftTile.barrier;
        };

        /*************************************************************
        *************************************************************/
        MovingObject.prototype.enteringRightTileBarrier=function()
        {
            var x=this.x+tileSize()/2.01;
            var leftTile=getGridObjectWithXYPosition(x,this.y);
            return leftTile.barrier;
        };

        /*************************************************************
        *************************************************************/
        MovingObject.prototype.enteringLowerTileBarrier=function()
        {
            var y=this.y+tileSize()/2.01;
            var lowerTile=getGridObjectWithXYPosition(this.x,y);
            return lowerTile.barrier;
        };

        /*************************************************************
        *************************************************************/
        MovingObject.prototype.enteringUpperTileBarrier=function()
        {
            var y=this.y-tileSize()/2.01;
            var upperTile=getGridObjectWithXYPosition(this.x,y);
            return upperTile.barrier;
        };
        
        /*************************************************************
        *************************************************************/
        MovingObject.prototype.isPassageWayAboveMe=function()
        {
            var y=this.y-tileSize();
            var upperTile=getGridObjectWithXYPosition(this.x,y);
            return !upperTile.barrier;
        };
        
        /*************************************************************
        *************************************************************/
        MovingObject.prototype.isPassageWayBelowMe=function()
        {
            var y=this.y+tileSize();
            var upperTile=getGridObjectWithXYPosition(this.x,y);
            return !upperTile.barrier;
        };
        
        /*************************************************************
        *************************************************************/
        MovingObject.prototype.isPassageWayRightOfMe=function()
        {
            var x=this.x+tileSize();
            var rightTile=getGridObjectWithXYPosition(x,this.y);
            return !rightTile.barrier;
        };
        
        /*************************************************************
        *************************************************************/
        MovingObject.prototype.isPassageWayLeftOfMe=function()
        {
            var x=this.x-tileSize();
            var leftTile=getGridObjectWithXYPosition(x,this.y);
            return !leftTile.barrier;
        };
        
        /*************************************************************
        Handles when the object needs to reverse direction
        // hmm, this is causing some issues
        *************************************************************/
        MovingObject.prototype.handleReverseDirection=function(nextMove)
        {
            if(this.movingRight && nextMove===NEXT_MOVE.LEFT)
            {
                getLastCommandedMoveFromUser("reset");
                MovingObject.prototype.setDirection.call(this,'LEFT');
            }
            if(this.movingLeft && nextMove===NEXT_MOVE.RIGHT)
            {
                getLastCommandedMoveFromUser("reset");
                MovingObject.prototype.setDirection.call(this,'RIGHT');
            }
            if(this.movingUp && nextMove===NEXT_MOVE.DOWN)
            {
                getLastCommandedMoveFromUser("reset");
                MovingObject.prototype.setDirection.call(this,'DOWN');   
            }
            if(this.movingDown && nextMove===NEXT_MOVE.UP)
            {
                getLastCommandedMoveFromUser("reset");
                MovingObject.prototype.setDirection.call(this,'UP');  
            }
        };

        /*************************************************************
        An internal move is when an object is moving in some
        direction and then decides to change direction
        *************************************************************/
        MovingObject.prototype.handleInternalMove=function(nextMove)
        {
            // When moving horizontally check for passageways above or below us
            if(this.movingRight || this.movingLeft)
            {
                if(MovingObject.prototype.isPassageWayAboveMe.call(this))
                {
                    if(nextMove===NEXT_MOVE.UP)
                    {
                        MovingObject.prototype.allignWithGrid.call(this);
                        MovingObject.prototype.setDirection.call(this,'UP');
                    }
                }
                if(MovingObject.prototype.isPassageWayBelowMe.call(this))
                {
                    if(nextMove===NEXT_MOVE.DOWN)
                    {
                        MovingObject.prototype.allignWithGrid.call(this);
                        MovingObject.prototype.setDirection.call(this,'DOWN');
                    }
                }
            }
            
            // When moving vertically check for passageways to the right or left of us
            if(this.movingUp || this.movingDown)
            {
                if(MovingObject.prototype.isPassageWayRightOfMe.call(this))
                {
                    if(nextMove===NEXT_MOVE.RIGHT)
                    {
                        MovingObject.prototype.allignWithGrid.call(this);
                        MovingObject.prototype.setDirection.call(this,'RIGHT');
                    }
                }
                if(MovingObject.prototype.isPassageWayLeftOfMe.call(this))
                {
                    if(nextMove===NEXT_MOVE.LEFT)
                    {
                        MovingObject.prototype.allignWithGrid.call(this);
                        MovingObject.prototype.setDirection.call(this,'LEFT');
                    }
                }
            }
        };

        /*************************************************************
        When we hit a wall, move in the opposite direction or
        move in the direction per the last commanded move
        returns true of a wall collision occurred
        *************************************************************/
        MovingObject.prototype.handleWallCollision=function(nextMove)
        {
            // Handle hit a left barrier
            if(MovingObject.prototype.enteringLeftTileBarrier.call(this))
            {
                MovingObject.prototype.allignWithGrid.call(this);
                if(nextMove===NEXT_MOVE.UP)
                {
                    MovingObject.prototype.setDirection.call(this,'UP');
                }
                else if(nextMove===NEXT_MOVE.DOWN)
                {
                    MovingObject.prototype.setDirection.call(this,'DOWN');
                }
                else
                {
                    MovingObject.prototype.setDirection.call(this,'RIGHT');
                }
                return true;
            }
            
            // handle hit a right barrier
            if(MovingObject.prototype.enteringRightTileBarrier.call(this))
            {
                MovingObject.prototype.allignWithGrid.call(this);
                if(nextMove===NEXT_MOVE.UP)
                {
                    MovingObject.prototype.setDirection.call(this,'UP');
                }
                else if(nextMove===NEXT_MOVE.DOWN)
                {
                    MovingObject.prototype.setDirection.call(this,'DOWN');
                }
                else
                {
                    MovingObject.prototype.setDirection.call(this,'LEFT');
                }
                return true;
            }
            
            // handle hit a lower barrier
            if(MovingObject.prototype.enteringLowerTileBarrier.call(this))
            {
                MovingObject.prototype.allignWithGrid.call(this);
                if(nextMove===NEXT_MOVE.RIGHT)
                {
                    MovingObject.prototype.setDirection.call(this,'RIGHT');
                }
                else if(nextMove===NEXT_MOVE.LEFT)
                {
                    MovingObject.prototype.setDirection.call(this,'LEFT');
                }
                else
                {
                    MovingObject.prototype.setDirection.call(this,'UP');
                }
                return true;
            }
            
            // handle hit a upper barrier
            if(MovingObject.prototype.enteringUpperTileBarrier.call(this))
            {
                MovingObject.prototype.allignWithGrid.call(this);
                if(nextMove===NEXT_MOVE.RIGHT)
                {
                    MovingObject.prototype.setDirection.call(this,'RIGHT');
                }
                else if(nextMove===NEXT_MOVE.LEFT)
                {
                    MovingObject.prototype.setDirection.call(this,'LEFT');
                }
                else
                {
                    MovingObject.prototype.setDirection.call(this,'DOWN');
                }
                return true;
            }
            
            return false;
        };
        
        /*************************************************************
        *************************************************************/
        MovingObject.prototype.update=function()
        {
            if(this.movingLeft){this.x-=this.speed;}
            if(this.movingRight){this.x+=this.speed;}
            if(this.movingUp){this.y-=this.speed;}
            if(this.movingDown){this.y+=this.speed;}
        };
    };
    
    /**************************************************************
    **************************************************************/
    var resetAllEatenPellets=function()
    {
        var len=gameTemplate().length;
        for(var x=0;x<len;x++)
        {
            var isEaten=gameTemplate()[x].isEaten;
            if(isEaten===undefined){continue;}
            gameTemplate()[x].isEaten=false;
        }
    };
    
    /**************************************************************
    A simple count down timer
    **************************************************************/
    var DownTimer=function()
    {
        this.now=millis();
        this.period=millis();
        DownTimer.prototype.reset=function(timePeriodInMillis)
        {
            this.period=timePeriodInMillis;
            this.now=millis();
        };
        
        DownTimer.prototype.timeIsUp=function()
        {
            return millis()>(this.now+this.period);
        };
        
        DownTimer.prototype.timeAlmostUp=function()
        {
            return millis()>(this.now+this.period*0.8);
        };
    };

    /**************************************************************
    PacMan
    **************************************************************/
    var PacMan=function(gridX,gridY)
    {
        MovingObject.call(this,gridX,gridY);

        this.mouthAngle=45;  // Mouth opens and closes as he moves
        this.mouthDir=1;
        this.isDying=false;
        this.isDead=false;
        this.justAteAPowerFoodPellet=false;

        /**************************************************************
        We must be able to reset the PacMan for new game
        **************************************************************/
        PacMan.prototype.reset=function()
        {
            this.mouthAngle=45;
            this.mouthDir=1;
            this.isDying=false;
            this.isDead=false;
            MovingObject.prototype.reset.call(this);
        };

        /**************************************************************
        Calculates the rotation angle for the draw function based
        on the direction of movement
        **************************************************************/
        PacMan.prototype.getRotationAngleFromDirection=function()
        {
            if(this.movingUp){return radians(270);}
            if(this.movingDown){return radians(90);}
            if(this.movingLeft){return radians(180);}
            return 0;
        };

        /**************************************************************
        Draw pac man
        **************************************************************/
        PacMan.prototype.draw= function() 
        {
            noStroke();
            fill(255,255,0);
            pushMatrix();
            translate(this.x,this.y);
            var angle=this.getRotationAngleFromDirection();
            rotate(angle);
            arc(0,0,tileSize(),tileSize(),radians(this.mouthAngle),radians(360-this.mouthAngle));
            popMatrix();
        };

        /**************************************************************
        Animates the pacman
        **************************************************************/
        PacMan.prototype.update=function()
        {
            if(this.isDead){return;}
            if(this.isDying)
            {
                this.mouthAngle+=1;
                if(this.mouthAngle>300){this.isDead=true;}
                return;
            }
            
            // Check the grid objects for pellets
            var gi=getGridObjectWithXYPosition(this.x,this.y);
            if(gi.isEaten!==undefined)
            {
                if(gi.isEaten===false)
                {
                    gameSounds.play("DoorSlam.mp3");
                    //playSound(getSound("retro/hit2"));
                    pelletCount--;
                    gameInfo.addPointsForEatingAPellet();
                    gi.isEaten=true;
                    if(gi.isPowerFoodPellet)
                    {
                        this.justAteAPowerFoodPellet=true;
                    }
            }
            }

            MovingObject.prototype.update.call(this);

            // animate the mouth
            if(this.mouthAngle>45){this.mouthDir=-7;}
            if(this.mouthAngle<1){this.mouthDir=7;}
            this.mouthAngle+=this.mouthDir;
            
            var key=getLastCommandedMoveFromUser();
            this.handleWallCollision(key);
            this.handleInternalMove(key);
            this.handleReverseDirection(key);
        };
    };
    PacMan.prototype=new MovingObject();
    
    /******************************************************************
    Helper function for finding if the first item is the shortest
    of the four paramenters
    ******************************************************************/
    var isShortest=function(testItem,i1,i2,i3)
    {
        return testItem<=i1 && testItem<=i2 && testItem<=i3;
    };
    
    var thePacMan=new PacMan(11,23);
    /******************************************************************
    There will be four of these directional selection algorithms
    for each type of ghost.  The algorithm will be assigned to the
    ghost based on its name
    gx: ghost x position
    gy: ghost y position
    choice: an array of movement choices that are allowed
    vulnerable: if the ghost is vulnerable to attack or not
    The blinky algorithm, he tries to follow you
    ******************************************************************/
    var blinkyDirSelect=function(gx,gy,choices,vulnerable)
    {
        var xd=gx-thePacMan.x;
        var yd=gy-thePacMan.y;
        
        if(vulnerable)
        {
            xd*=-1;
            yd*=-1;
        }

        // If we are allowed to move left and PacMan is left of us do it
        var canMoveLeft=choices.findIndex(function(m){return m===NEXT_MOVE.LEFT;})!==-1;
        var canMoveRight=choices.findIndex(function(m){return m===NEXT_MOVE.RIGHT;})!==-1;
        var canMoveUp=choices.findIndex(function(m){return m===NEXT_MOVE.UP;})!==-1;
        var canMoveDown=choices.findIndex(function(m){return m===NEXT_MOVE.DOWN;})!==-1;

        var ydu=yd-gridSize();
        var ydd=yd+gridSize();
        var xdr=xd+gridSize();
        var xdl=xd-gridSize();
        var xd2=xd*xd;
        var yd2=yd*yd;
        var ydu2=ydu*ydu;
        var ydd2=ydd*ydd;
        var xdr2=xdr*xdr;
        var xdl2=xdl*xdl;
        
        var upD=sqrt(xd2+ydu2);
        var downD=sqrt(xd2+ydd2);
        var leftD=sqrt(xdl2+yd2);
        var rightD=sqrt(xdr2+yd2);

        if(canMoveUp && isShortest(upD,downD,leftD,rightD))
        {
            return NEXT_MOVE.UP;
        }
        
        if(canMoveDown && isShortest(downD,upD,leftD,rightD))
        {
            return NEXT_MOVE.DOWN;
        }
        
        if(canMoveLeft && isShortest(leftD,upD,rightD,downD))
        {
            return NEXT_MOVE.LEFT;
        }
        
        if(canMoveRight && isShortest(rightD,upD,downD,leftD))
        {
            return NEXT_MOVE.RIGHT;
        }

        // If all else fails do a random move
        var numChoices=choices.length;
        var index=round(random(0,numChoices-1));
        var retval=choices[index];
        return retval;
    };
    
    /******************************************************************
    ******************************************************************/
    var pinkyDirSelect=function(gx,gy,choices,vulnerable)
    {
        var numChoices=choices.length;
        var index=round(random(0,numChoices-1));
        var retval=choices[index];
        return retval;
    };
    
    /******************************************************************
    ******************************************************************/
    var inkyDirSelect=function(gx,gy,choices,vulnerable)
    {
        var numChoices=choices.length;
        var index=round(random(0,numChoices-1));
        var retval=choices[index];
        return retval;
    };

    /******************************************************************
    ******************************************************************/
    var clydeDirSelect=function(gx,gy,choices,vulnerable)
    {
        var numChoices=choices.length;
        var index=round(random(0,numChoices-1));
        var retval=choices[index];
        return retval;
    };
    

    /******************************************************************
    We will have 4 ghost just like the original game
    ******************************************************************/
    var Ghost=function(gridX,gridY,name,behavior)
    {
        MovingObject.call(this,gridX,gridY);
        this.behavior=behavior;
        this.name=name;
        var c=this.name==="blinky"?color(255,0,0):
              this.name==="pinky"?color(255,150,150):
              this.name==="inky"?color(0,255,255):color(255,80,0);
        this.c=c;
        this.vulnerable=false;  // true when pac man can eat them
        this.toggleColor=false;
        this.prevVulnerable=this.vulnerable;    // Needed for one shot
        this.name=name;
        
        this.tmr=new DownTimer();
        /**************************************************************
        **************************************************************/
        Ghost.prototype.MakeVulnerable=function()
        {
            this.tmr.reset(10000);
            this.vulnerable=true;
        };
        
        /**************************************************************
        We will have 4 ghost just like the original game
        **************************************************************/
        Ghost.prototype.draw= function() 
        {
            var size=tileSize();  
            var w=size;
            var h=size;
            var pupilOffset=w/10;
            var xPupilOffset;
            var yPupilOffset;

            if(this.vulnerable)
            {
                if(this.prevVulnerable!==this.vulnerable)
                {
                    // Change the ghost direction now that afraid
                    if(this.movingLeft){this.setDirection('RIGHT');}
                    else if(this.movingRight){this.setDirection('LEFT');}
                    else if(this.movingUp){this.setDirection('DOWN');}
                    else if(this.movingDown){this.setDirection('UP');}
                }
                
                
                if(this.tmr.timeIsUp())
                {
                    this.vulnerable=false;
                    fill(255,255,255);
                }
                else if(this.tmr.timeAlmostUp())
                {
                    this.toggleColor=!this.toggleColor;
                    if(this.toggleColor)
                    {
                        fill(255, 0, 0);
                    }
                    else
                    {
                        fill(255, 255, 255);
                    }
                }
                else
                {
                    fill(255,255,255);
                }
            }
            else
            {
                fill(this.c);
            }
            this.prevVulnerable=this.vulnerable;
            
            noStroke();
            pushMatrix();
            translate(this.x,this.y);
            // draw the body
            arc(0,0,w,h,radians(180),radians(359.999));
            beginShape();
            vertex(-w/2,0);
            vertex(-w/2,h/6);
            vertex(w/2,h/6);
            vertex(w/2,0);
            endShape();
            ellipse(-w/3,h/5,w/3,w/3);
            ellipse(0,h/5,w/3,w/3);
            ellipse(w/3,h/5,w/3,w/3);
            
            // draw the eyes
            fill(255,255,255);
            ellipse(-w/5,-h/5,w/3,w/3);
            ellipse(w/5,-h/5,w/3,w/3);
            
            // draw the pupils
            xPupilOffset=0;
            yPupilOffset=0;
            if(this.movingUp){yPupilOffset=-pupilOffset;}
            if(this.movingDown){yPupilOffset=pupilOffset;}
            if(this.movingRight){xPupilOffset=pupilOffset;}
            if(this.movingLeft){xPupilOffset=-pupilOffset;}
            fill(0,0,0);
            ellipse(-w/4+xPupilOffset,-h/5+yPupilOffset,w/6,w/6);
            ellipse(w/4+xPupilOffset,-h/5+yPupilOffset,w/6,w/6);
            popMatrix();
        };

        /**************************************************************
        We need to know when the available pathways state has changed!
        **************************************************************/
        this.pathWayState=0;
        Ghost.prototype.pathWayStateChanged=function()
        {
            var prevPathWay=this.pathWayState;
            this.pathWayState=0;
            this.pathWayState|=this.isPassageWayAboveMe()?1:0;
            this.pathWayState|=this.isPassageWayBelowMe()?2:0;
            this.pathWayState|=this.isPassageWayRightOfMe()?4:0;
            this.pathWayState[3]=this.isPassageWayLeftOfMe()?8:0;
            return prevPathWay!==this.pathWayState;
        };


        /**************************************************************
        **************************************************************/
        this.nextMove=NEXT_MOVE.UP;
        this.debug=0;
        Ghost.prototype.handleRandomMoves=function()
        {
            if(!this.pathWayStateChanged()){return;}

            var u=this.isPassageWayAboveMe();
            var d=this.isPassageWayBelowMe();
            var r=this.isPassageWayRightOfMe();
            var l=this.isPassageWayLeftOfMe();
            
            // handle all three directional moves
            if(u && !d && l && r)
            {
                this.nextMove=this.behavior(this.x,this.y,
                [   NEXT_MOVE.UP,
                    NEXT_MOVE.LEFT,
                    NEXT_MOVE.RIGHT
                    ],this.vulnerable);
            }
            
            if(!u && d && l && r)
            {
                this.nextMove=this.behavior(this.x,this.y,
                [   NEXT_MOVE.UP,
                    NEXT_MOVE.RIGHT,
                    NEXT_MOVE.DOWN
                    ],this.vulnerable);
            }
            
            if(u && d && !r && l)
            {
                this.nextMove=this.behavior(this.x,this.y,
                [   NEXT_MOVE.UP,
                    NEXT_MOVE.DOWN,
                    NEXT_MOVE.LEFT
                    ],this.vulnerable);
            }
            
            if(u && d && r && !l)
            {
                this.nextMove=this.behavior(this.x,this.y,
                [   NEXT_MOVE.UP,
                    NEXT_MOVE.DOWN,
                    NEXT_MOVE.RIGTH
                    ],this.vulnerable);
            }
            
            // Handle two choice solutions
            if(u && !d && l && !r)
            {
                this.nextMove=this.behavior(this.x,this.y,
                [   NEXT_MOVE.UP,
                    NEXT_MOVE.LEFT
                    ],this.vulnerable);
            }

            if(!u && d && l && !r)
            {
                this.nextMove=this.behavior(this.x,this.y,
                [   NEXT_MOVE.DOWN,
                    NEXT_MOVE.LEFT
                    ],this.vulnerable);
            }

            if(!u && d && !l && r)
            {
                this.nextMove=this.behavior(this.x,this.y,
                [   NEXT_MOVE.DOWN,
                    NEXT_MOVE.RIGHT
                    ],this.vulnerable);
            }

            if(u && !d && !l && r)
            {
                this.nextMove=this.behavior(this.x,this.y,
                [   NEXT_MOVE.UP,
                    NEXT_MOVE.RIGHT
                    ],this.vulnerable);
            }
        };
        
        /**************************************************************
        **************************************************************/
        Ghost.prototype.update=function()
        {
            var prevSpeed=this.speed;
            if(this.vulnerable){this.speed*=0.7;}   // slow down when vulneralb
            MovingObject.prototype.update.call(this);
            
            // after updating restore normal speed
            this.speed=prevSpeed;
            
            this.handleRandomMoves();
            
            
            this.handleWallCollision(this.nextMove);
            this.handleInternalMove(this.nextMove);
        };
        
        /**************************************************************
        **************************************************************/
        var isCloseToSame=function(p1,p2,sigma)
        {
            var diff=abs(p1-p2);
            return diff<sigma;
        };
        
        /**************************************************************
        Returns true if this ghost is colliding with the PacMan
        x and y are the x and y cordinates of the PacMan
        **************************************************************/
        Ghost.prototype.isCollidingWithMe=function(x,y)
        {
            var xColliding=isCloseToSame(this.x,x,gridSize()/2);
            var yColliding=isCloseToSame(this.y,y,gridSize()/2);
            return xColliding && yColliding;
        };
    };
    Ghost.prototype=new MovingObject();
    
    /******************************************************************
    This displays the game score, the number of lives the user has
    and the current level
    ******************************************************************/
    var GameProgress=function()
    {
        this.score=0;
        this.level=1;
        this.numLives=3;
        
        /**************************************************************
        Reset the game to the start states
        **************************************************************/
        GameProgress.prototype.reset=function()
        {
            this.score=0;
            this.level=1;
            this.numLives=3;
        };
        
        /**************************************************************
        Reset the game to the start states
        **************************************************************/
        GameProgress.prototype.addPointsForEatingAPellet=function()
        {
            var points=this.level*round(random(1,10));
            this.score+=points;
        };
        
        /**************************************************************
        **************************************************************/
        GameProgress.prototype.addPointsForEatingAGhost=function(n)
        {
            var points=this.level*100*n;
            this.score+=points;
        };
        
        /**************************************************************
        Draw the game stats
        **************************************************************/
        GameProgress.prototype.draw= function() 
        {
            // Closure to return an array of 5 PacMen
            var pacMen=(function()
            {
                var pacMen=[
                    new PacMan(11,0),
                    new PacMan(12,0),
                    new PacMan(13,0),
                    new PacMan(14,0),
                    new PacMan(15,0)
                ];
                for(var x=0;x<pacMen.length;x++)
                {
                    pacMen[x].setDirection('RIGHT');
                }
                var retval=function(){return pacMen;};
                return retval;
            })();
            
            noStroke();
            textAlign(LEFT);
            fill(0,128,128,100);
            var h=tileSize();
            rectMode(TOP);
            rectMode(LEFT);
            rect(0,0,width,h);
            var textY=2*tileSize()/2.3;
            var scoreX=0;
            fill(255, 0, 0);
            textFont(createFont("fantasy"),tileSize());
            text("SCORE: "+this.score,scoreX,textY);
            var livesX=3*width/10;
            text("LIVES: ",livesX,textY);
            for(var x=0;x<this.numLives;x++)
            {
                pacMen()[x].draw();
            }
            var levelX=7*width/10;
            fill(255, 0, 0);
            text("LEVEL: "+this.level,levelX,textY);
        };
    };
    
    /*******************************************************************
    *******************************************************************/
    var Ghosts=function()
    {
        this.ghosts=[];

        /*******************************************************************
        *******************************************************************/
        Ghosts.prototype.reset=function()
        {
            this.ghosts=[];
            this.ghosts.push(new Ghost(round(random(12,14)),13,"blinky",blinkyDirSelect));
            this.ghosts.push(new Ghost(round(random(12,14)),13,"pinky",pinkyDirSelect));
            this.ghosts.push(new Ghost(round(random(12,14)),13,"inky",inkyDirSelect));
            this.ghosts.push(new Ghost(round(random(12,14)),13,"clyde",clydeDirSelect));
        };
        this.reset();
        
        /*******************************************************************
        *******************************************************************/
        Ghosts.prototype.draw=function() 
        {
            this.ghosts.forEach(function(m){m.draw();});
        };
        
        /*******************************************************************
        *******************************************************************/
        Ghosts.prototype.update=function()
        {
            this.ghosts.forEach(function(m){m.update();});
        };

        /*******************************************************************
        Returns true if a ghost is colliding with pac man and the ghost
        is not vulnerable.  If vulnerable.  The ghost is removed and a
        new one added to the scene and we still return false
        *******************************************************************/
        Ghosts.prototype.handlePossibleGhostCollision=function(x,y)
        {
            var isColliding=false;
            for(var i=0;i<this.ghosts.length;i++)
            {
                if(this.ghosts[i].isCollidingWithMe(x,y))
                {
                    if(this.ghosts[i].vulnerable)
                    {
                        var name=this.ghosts[i].name;
                        var behavior=this.ghosts[i].behavior;
                        this.ghosts.splice(i,1);
                        var p=round(random(12,14));
                        this.ghosts.push(new Ghost(p,13,name,behavior));
                        //playSound(getSound("rpg/coin-jingle"));
                        gameInfo.addPointsForEatingAGhost(1);
                    }
                    else
                    {
                        isColliding=true;
                    }
                }
            }
            return isColliding;
        };
    };

    var gameInfo=new GameProgress();
    var theGhosts=new Ghosts();
    /******************************************************************
    Handles the next Scene
    moveToNext: true if you want to move to the next scene, leave
    empty to stay on current scene
    returns the current scene
    ******************************************************************/
    var nextScene=(function(moveToNext)
    {
        var currentScene=1;
        var retval=function(moveToNext)
        {
            if(moveToNext===undefined){return currentScene;}
            if(moveToNext===false){return currentScene;}
            currentScene++;
            
            // if we are transitioning to scene 2 we need to reset
            // all the game states
            if(currentScene===2)
            {
                gameSpeed=startingGameSpeed;    // A new game starts a default speed
                thePacMan.reset();
                gameInfo.reset();
                theGhosts.reset();
                getLastCommandedMoveFromUser("reset");    // reset to no key
                resetAllEatenPellets();
            }
            
            if(currentScene===4){currentScene=1;}
            return currentScene;
        };
        return retval;
    })();

    /******************************************************************
    Scene 1 closures to make life easier
    ******************************************************************/
    // Get a pacman on the screen but only create him once
    var bannerPacMan=(function()
    {
        var bannerPM=new PacMan(11,9);
        bannerPM.setDirection('RIGHT');
        bannerPM.size=width/6;
        var retval=function(){return bannerPM;};
        return retval;
    })();
    
    // Get some ghosts on the screen but only create them once
    var bannerGhosts=(function()
    {
        var counter=0;
        var terminalCount=100;
        var bannerG=[
            new Ghost(8,13,"blinky"),
            new Ghost(10,13,"pinky"),
            new Ghost(12,13,"inky"),
            new Ghost(14,13,"clyde"),
            ];
            bannerG[0].setDirection('RIGHT');
            bannerG[2].setDirection('UP');
            bannerG[3].setDirection('DOWN');
        var retval=function()
        {
            counter++;
            if(counter===terminalCount){counter=0;}
            if(counter===20)
            {
                bannerG[0].setDirection('RIGHT');
                bannerG[1].setDirection('LEFT');
                bannerG[2].setDirection('UP');
                bannerG[3].setDirection('DOWN');
            }
            if(counter===50)
            {
                bannerG[0].setDirection('UP');
                bannerG[1].setDirection('RIGHT');
                bannerG[2].setDirection('LEFT');
                bannerG[3].setDirection('UP');
            }
            return bannerG;
        };
        return retval;
    })();
    
    // Make the fill color an oozing color
    var bannerColor=(function()
    {
        var r=128; var g=128; var b=128; var t=50;
        var rd=1;   var gd=-1;  var bd=1;   var td=0.2;
        var retval=function()
        {
            r+=rd;  
            g+=gd;  
            b+=bd;  
            t+=td;
            if(r===255){rd=-1;}
            if(r===0){rd=1;}
            if(g===255){gd=-1;}
            if(g===0){gd=1;}
            if(b===255){bd=-1;}
            if(b===0){bd=1;}
            if(t<100){td=0.2;}
            if(t>254){td=-0.2;}
            return color(r,g,b,t);
        };
        return retval;
    })();

    /******************************************************************
    Scene 1 is the startup banner scene for PacMan
    ******************************************************************/
    var HandleScene1=function()
    {
        background(0, 0, 0);
        bannerPacMan().draw(); 
        bannerGhosts().forEach(function(m){m.draw();});
        pushMatrix();
        translate(width/2,0);
        textAlign(CENTER);
        textSize(width/10);
        fill(bannerColor());
        text("PacMan",0,height/2);
        textSize(width/20);
        text("Left Click On screen to start playing...",0,height/1.5);
        popMatrix();
        nextScene(mouseWasClicked());
    };
    
    /******************************************************************
    Scene 2 is where you play the game
    ******************************************************************/
    var HandleScene2=function()
    {
        background(0, 0, 0);
        // Lets test drawing tiles
        for(var x=0;x<gameTemplate().length;x++)
        {
            gameTemplate()[x].draw();
        }
        thePacMan.draw();
        thePacMan.update();
        theGhosts.draw();
        theGhosts.update();

        if(theGhosts.handlePossibleGhostCollision(thePacMan.x,thePacMan.y) || 
            thePacMan.isDying)
        {
            if(thePacMan.isDying===false)
            {
                //playSound(getSound("rpg/giant-no"));
                thePacMan.isDying=true;
            }
            if(thePacMan.isDead)
            {
                // Check for more lives here
                gameInfo.numLives--;
                if(gameInfo.numLives===0)
                {
                    nextScene(true); // game over dude
                }
                else
                {
                    thePacMan.reset();
                    theGhosts.reset();
                    getLastCommandedMoveFromUser("reset");    // reset to no key
                }
            }
        }
        
        // If all pellets have been eaten time for next level
        if(pelletCount===0)
        {
            pelletCount=totalPelletCount();
            resetAllEatenPellets();
            gameSpeed*=1.1;
            thePacMan.reset();
            theGhosts.reset();
            getLastCommandedMoveFromUser("reset");    // reset to no key
            gameInfo.level++;
            if(gameInfo.numLives!==5)
            {
                gameInfo.numLives++;
            }
        }
        
        // If a power food pellet has been eaten inform the ghost
        // to draw ready to eat me pattern
        if(thePacMan.justAteAPowerFoodPellet)
        {
            theGhosts.ghosts.forEach(function(m){m.MakeVulnerable();});
            thePacMan.justAteAPowerFoodPellet=false;
        }
        
        gameInfo.draw();

        nextScene(mouseWasClicked());
    };
    
    /******************************************************************
    Scene 3 is when the game is over it shows stats
    ******************************************************************/
    var HandleScene3=function()
    {
        background(0, 0, 0);
        fill(bannerColor());
        pushMatrix();
        translate(width/2,0);
        textSize(height*0.08);
        textAlign(CENTER);
        text("GAME OVER!",0,height*0.1);
        textSize(height*0.08);
        text("You achieved Level: "+gameInfo.level,0,height*0.2);
        textSize(height*0.1);
        text("YOU SCORED",0,height*0.3);
        text(gameInfo.score,0,height*0.4);
        text("POINTS!",0,height*0.5);
        textSize(height*0.05);
        text("Click left mouse buton to continue...",0,height*0.7);
        popMatrix();
        nextScene(mouseWasClicked());
    };
    
    /******************************************************************
    The scene may be in any of three states, at start in state 1
    ******************************************************************/
    var Scene=(function(scene)
    {
        var handlers=[HandleScene1,HandleScene2,HandleScene3];
        var retval=function(scene){return handlers[scene-1];};
        return retval;
    })();

    /******************************************************************
    call this on the game object from the draw function
    ******************************************************************/
    PacManGame.prototype.run=function()
    {
        Scene(nextScene())();
    };
};

/**********************************************************************
Initialize and return the one and only PacMan Game
**********************************************************************/
var PlayPacManGame=(function()
{
    var game=new PacManGame();
    var retval=function(){return game;};
    return retval;
})();

// EOF ****************************************************************

