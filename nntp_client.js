var net = require('net');
//var readline = require('readline-sync');
  
const readline = require('readline');
  
  var startswith = function(string, substring) {
  if (string.indexOf(substring) == 0) {
    return true;
  }
  else {
    return false;
  }
}

var net = require('net');

function replDemo() {
  return new Promise(function(resolve, reject) {
    let rl = readline.createInterface(process.stdin, process.stdout)
    rl.setPrompt('COMMAND? ')
    rl.prompt();
    rl.on('line', function(line) {
      
	  
	var client = net.connect(119, '127.0.0.1', function() {
	//console.log('Connected to server');
	if (line === "exit" || line === "quit" || line == 'q') {
		client.end();
        
		client.destroy();
		rl.close();
        return // bail here, so rl.prompt() isn't called again
      }
	
    
	client.write(line);
	client.on('data', function(data) {
	console.log('Received: ' + data);
	//client.end();
	rl.prompt();
	
	//client.destroy(); // kill client after server's response
    });
	
	client.on('error', (e) => {
		console.log(e);
	});

	
	
	//if(command.startswith('exit')) break;

	
});
	 
    }).on('close',function(){
      console.log('bye')
      resolve(42) // this is the final result of the function
    });
  })
}
async function run() {
  try {
    let replResult = await replDemo()
    //console.log('repl result:', replResult)

  } catch(e) {
    console.log('failed:', e)
  }
}

run()



