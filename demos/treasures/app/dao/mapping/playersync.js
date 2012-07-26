var UserSync = module.exports =  {

  updateUser:function(client,val){
	  console.error(' updatewrite ' + JSON.stringify(val)+ '  ' + val.x+ '  ' +val.y + '  ' +val.uid);
		var sql = 'update Hero set x = ? ,y = ? ,sceneId = ? where id = ?';
		var args = [val.x, val.y, val.sceneId, val.uid];
		client.query(sql, args, function(err, res){
		      if(err !== null){
		        console.error('write mysql failed!　' + sql + ' ' + JSON.stringify(val));
		     } else {
		    	  console.info('write mysql success! flash dbok ' + sql + ' ' + JSON.stringify(val));
		    }
		    });
	},

	selectUser:function(client,val,cb){
		console.error(' selectUser  ' + JSON.stringify(val));
	  var sql = 'select * from  Hero where id = ?';
	  var args = [val];
	  client.query(sql, args, function(err, res){
	    if(err !== null){
	      console.error('selectUser mysql failed!　' + sql + ' ' + JSON.stringify(val));
	  	  cb(null,'-1');
	   } else {
	  	  console.info('selectUser mysql success! flash dbok ' + sql + ' ' + JSON.stringify(val));
	      cb(null,res[0]['name']);
	  }
	  });
	}

};