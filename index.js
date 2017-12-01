const express = require('express');
const webdriver = require('selenium-webdriver');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3300;
const path = require("path");
var webPath = 'localhost:' + port;
var chrome = require('selenium-webdriver/chrome');

console.log( __dirname );
const { writeFile } = require('fs');
const { promisify } = require('util');
app.use(express.static(path.join(__dirname, '.')));


var seleniumService = new chrome.ServiceBuilder( __dirname   + '/resources/chromedriver.exe' ).build();
chrome.setDefaultService( seleniumService );

new SocketsHandler( io, {} );

http.listen(port, function(){
  console.log('listening on *:' + port);
});


function SocketsHandler( io,config ){
	this.subscribers = {};
  this.robotStudios = {};
  this.robotExts = {};

	var self = this;
	
	io.on('connection', function( socket ){
	  console.log('a user connected #####################');
	  socket.emit( 'subscribe', { set: true } );

        socket.on('subscribeRobotExt', function( msg ){
            self.setSubscriberByType( 'robotExts', msg.userId, socket );
            //send an action to perform in studio
            socket.on('studioCall', function( msg ){
                if( msg.userId ){
                    self.notifySubscriberByType( 'robotStudios', msg.userId, 'studioAction', msg );
                }
            });
        });

        socket.on('subscribeRobotStudio', function( msg ){
            self.setSubscriberByType( 'robotStudios', msg.userId, socket );
            //send an action to perform in background
            socket.on('extCall', function( msg ){
                if( msg.userId ){
                    self.notifySubscriberByType( 'robotExts', msg.userId, 'extAction', msg );
                }
            });

            socket.on('openBrowser', function( msg ){
              openBrowser( msg );
            });

        });
      
	  socket.on('disconnect', function() {
	      console.log('Got disconnect!');
          self.removeSubscriber( socket );
          self.removeSubscriberByType( 'robotStudios', socket._userId, socket );
          self.removeSubscriberByType( 'robotExts', socket._userId, socket );
		 
	   });
	    
	});
}

SocketsHandler.prototype.setSubscriberByType = function( type, userId, socket ){
    socket[type] = true;
    socket._userId = userId;
    
    if( this[ type ][ userId ]){
        this[ type ][ userId ].push( socket );
    }else{
        this[ type ][ userId ] = [ socket ];
    }
}

SocketsHandler.prototype.removeSubscriberByType = function( type, userId, socket ){ 
    if( socket[type] && this[ type ][ userId ]){
        var index = null;
         for( var i =0; i< this[ type ][ userId ].length ; i++ ){
            if( this[ type ][ userId ][i]._uuid == socket._uuid )
                index = i;
        }
        
        if( index != null ){
            this[ type ][ userId ].splice( index, 1 );
        }
    }
}

//remove only the socket related with the closed tab
SocketsHandler.prototype.removeSubscriber = function( socket ){
    if( this.subscribers[ socket._userId ]){
        var index = null;
         for( var i =0; i< this.subscribers[ socket._userId  ].length ; i++ ){
            if( this.subscribers[ socket._userId  ][i]._uuid == socket._uuid )
                index = i;
        }
        
        if( index != null ){
            this.subscribers[ socket._userId  ].splice( index, 1 );
        }
    }
}

SocketsHandler.prototype.notifySubscriber = function( userId, msgType, message ){
    if(  this.subscribers[ userId ] ){
        for( var i =0; i< this.subscribers[ userId ].length ; i++ ){
            this.subscribers[ userId ][i].emit( msgType, message, function(){
                  
            });
        }
    }
}

SocketsHandler.prototype.notifySubscriberByType = function( type, userId, msgType, message ){
    if(  this[ type ][ userId ] ){
        for( var i =0; i< this[ type ][ userId ].length ; i++ ){
            this[ type ][ userId ][i].emit( msgType, message, function(){
                  
            });
        }
    }
}

SocketsHandler.prototype.sendMessage = function( userId, msgType, message, callback ){
    if(  this.subscribers[ userId ] && this.subscribers[ userId ].length > 0 ){
        // this.subscribers[ userId ].emit( msgType, message, function(){
                  
        // });
        this.notifySubscriber( userId, msgType, message );
        callback( true ); 
    }else
        callback( false );         
}

SocketsHandler.prototype.constructor = SocketsHandler;



function openBrowser(msg) {
    var chromeCapabilities = webdriver.Capabilities.chrome();

    var args = [];
    //args.push('--incognito');
    args.push('--user-data-dir=' + __dirname   + '/resources/Chrome-User-Data');
    args.push('--load-extension=' + __dirname   + '/resources/GS-Crawler-Extension');

    chromeCapabilities.caps_.chromeOptions = { 'args': args };

    const driver = new webdriver.Builder().withCapabilities( chromeCapabilities ).build();
    driver.get( msg.url );
}