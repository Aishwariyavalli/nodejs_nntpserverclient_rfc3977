var net = require('net');
var mysql = require('mysql');
  var readline = require('readline-sync');
  var fs=require('fs');
  var http=require('http');
  
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nntp"
});
con.connect(function(err) {
	if (err) throw err
	
});

var END = '\r\n';
var startswith = function(string, substring) {
  if (string.indexOf(substring) == 0) {
    return true;
  }
  else {
    return false;
  }
}
var server = net.createServer(function (socket) {
	socket.setEncoding("ascii");
  
  socket.on('connect', function() {
	   this.client = {socket : socket, group : null, article_index : null};
	console.log('Client connected');
	//socket.write('hello');
	
    socket.write('201 nntpd.js server ready (no posting allowed)' + END);
	socket.pipe(socket);
  });
  socket.on('data', function(data) {
	  command = data.toLowerCase();
	   if (startswith(command, 'help')) {
        console.log('HELP');
        socket.write('100 help text follows' + END);
        socket.write('nntpd.js is a minimal implementation of NNTP in node.js.' + END);
        socket.write('Available commands:' + END);
        socket.write('HELP' + END);
        socket.write('GROUP' + END);
		socket.write('ARTICLE'+END);
		socket.write('POST'+END);
		socket.write('NEWSGROUP'+END);
    }
	else if (startswith(command, 'article')) {
		console.log('ARTICLE');
		var id=command[9];
		//console.log(id);
		
			var sql = 'SELECT * FROM articles WHERE article_id = ?';
            con.query(sql, [id], function (err, result) {
           if (err) throw err;
           Object.keys(result).forEach(function(key) {
      var row = result[key];
      //console.log(row.body);
	   socket.write(row.article_id.toString());
	   fs.readFile(row.body, function(err, data) {
     socket.write('article '+row.body+' fetched');
    socket.write(data);
     });
	   
	  //socket.write(row.body.toString());
    });
  });
		
 }  
 //post <4@127.0.0.1> fy.txt group1
 else if(startswith(command,'post')){
	 console.log('POST');
	 var id1=command[6];
	 var array=command.split(' ');
	 var body1= array[2];
	 var groupid=array[3];
	 //console.log(body1);
	 var path='./'+body1;
	 //var date=new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' '); 
	 var date=new Date(Date.now());
	 var year = date.getFullYear();
	  var month =date.getMonth()+1;
	  var day=date.getDate();
	  var hours=date.getHours();
	  var minutes=date.getMinutes();
	  var seconds=date.getSeconds();
	  var sdate= year + '-' + month + '-' + day + ' '+ hours + ':' + minutes + ':' + seconds;
     fs.access(path, fs.F_OK, (err) => {
  if (err) {
    socket.write('441 posting failed');
    return;
  }
  //console.log(date);
  
     
	 var sql1="INSERT INTO articles(article_id,body,post_date,group_name) VALUES" +"(" + id1 + "," + "'"+ body1 + "'"+ "," + "'"+ sdate +"'" + ","+"'"+groupid+"'"+")";
    //console.log(sql1);
   con.query(sql1,function(err,result){
     if(err) throw err
   socket.write('240 article posted ok');
  });
	
});
	 
 }
//newsnews august 8 2019 10:30:01
 else if(startswith(command,'newsnews')){
	 console.log('NEWSNEWS');
	 //console.log('command:'+command);
	 var array = command.split(" ");
	 var strdate=array[1]+' '+ array[2]+' '+array[3]+' '+array[4];
	 //console.log("recieved:"+strdate);
	 var date=new Date(strdate);
	 //date.toLocaleTimeString();
	 //console.log("node js date:"+date);
	// var sdate=date.toISOString().slice(0,19).replace('T',' ');
	 //console.log("sqldate:"+sdate);
	  var year = date.getFullYear();
	  var month =date.getMonth()+1;
	  var day=date.getDate();
	  var hours=date.getHours();
	  var minutes=date.getMinutes();
	  var seconds=date.getSeconds();
	  var sdate= year + '-' + month + '-' + day + ' '+ hours + ':' + minutes + ':' + seconds;
	  //console.log("sqldate:"+sdate);
	
    
	 var sql1="SELECT * from articles where post_date>="+ " ' "+sdate+"'";
 //console.log(sql1);
   con.query(sql1,function(err,result){
     if(err) throw err
   socket.write('230 list of article ids:');
        Object.keys(result).forEach(function(key) {
      var row = result[key];
      //console.log(row.body);
	   socket.write(row.article_id.toString());
	   
	  //socket.write(row.body.toString());
    });
   
  });
 }
 else if(startswith(command,'newsgroup')){
	 console.log('NEWSGROUP');
	 //console.log('command:'+command);
	 var array = command.split(" ");
	 var strdate=array[1]+' '+ array[2]+' '+array[3]+' '+array[4];
	 //console.log("recieved:"+strdate);
	 var date=new Date(strdate);
	 //date.toLocaleTimeString();
	 //console.log("node js date:"+date);
	// var sdate=date.toISOString().slice(0,19).replace('T',' ');
	 //console.log("sqldate:"+sdate);
	  var year = date.getFullYear();
	  var month =date.getMonth()+1;
	  var day=date.getDate();
	  var hours=date.getHours();
	  var minutes=date.getMinutes();
	  var seconds=date.getSeconds();
	  var sdate= year + '-' + month + '-' + day + ' '+ hours + ':' + minutes + ':' + seconds;
	  //console.log("sqldate:"+sdate);
	 
    
	 var sql1="SELECT DISTINCT(group_name) from articles where post_date>="+ " ' "+sdate+"'";
 //console.log(sql1);
   con.query(sql1,function(err,result){
     if(err) throw err
   socket.write('231 list of group names:');
        Object.keys(result).forEach(function(key) {
      var row = result[key];
      //console.log(row.body);
	   socket.write(row.group_name);
	   
	  //socket.write(row.body.toString());
    });
   
  });
	
 }
 //group group1
  else if(startswith(command,'group')){
	  console.log('GROUP');
	  var array=command.split(' ');
	  var groupid1=array[1];
	  
 
	 var sql1="SELECT COUNT(article_id) as countids from articles where group_name="+ "'"+groupid1+"'";
    //console.log(sql1);
	var count;
	var flag;
	 flag=0;
	   con.query(sql1,function(err,result){
     if(err) throw err
     var c=result[0].countids;
	  count=result[0].countids;
	  //console.log(count);
	  if(count==0) { socket.write('411 no such newsgroups'); flag=1;}
	  else{
	  var sql2="SELECT article_id from articles where group_name="+ "'"+groupid1+"'";
    //console.log(sql2);
	   con.query(sql2,function(err,result){
     if(err) throw err
     //message=message+result[0].countids
	 var id1=result[0].article_id.toString();
	 var id2=result[count-1].article_id.toString();
	 var message='211 '+count+ ' '+id1+ ' '+id2+ ' '+groupid1;
	socket.write(message);
	   
     
	   });
	  }
	   });
	  
	   
	   
	   
	  
	  
  }
    else if(startswith(command,'list')){
		console.log('LIST');
		
    
	 var sql1="SELECT DISTINCT(group_name) from articles";
    //console.log(sql1);
	var count;
	var count2;
	var flag;
	 flag=0;
	   con.query(sql1,function(err,result){
     if(err) throw err
     count=result.length;
	  //console.log(count);
	 var i;
	 i=0;
	  while(i<count){
		  groupid2=result[i].group_name;
	  var sql2="SELECT * from articles where group_name="+ "'"+groupid2+"'";
    //console.log(sql2);
	   con.query(sql2,function(err,result){
     if(err) throw err
	 count2=result.length;
     //message=message+result[0].countids
	 var id1=result[0].article_id.toString();
	 var id2=result[count2-1].article_id.toString();
	 var message=result[0].group_name+' '+id2+' '+id1+' '+'test articles'+' '+'y';
	socket.write(message);
	   
     
	   });
	   i++
	  }
	   });
		
		
	}
 });
});
server.listen(119, function() { //'listening' listener
  console.log('server bound');
});