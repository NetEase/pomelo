var serverUtil = module.exports;

serverUtil.getCountData = function(data){
    if(data.length<1){return;}
    var routes=[];
    routes.push(data[0].route);
    for(var i=1;i<data.length;i++){
        var flag=false;
        for(var j=0;j<routes.length;j++){
            if(routes[j]===data[i].route){
                flag=true;
                break;
            }
        }
        if(!flag){
            routes.push(data[i].route);
        }
    }
    var returnArray=[];
    for(var i=0;i<routes.length;i++){
        var countData={};
        countData.route=routes[i];
        var totalNumber=0;
        var totalTime=0;
        var maxTime=0;
        var minTime=100000;
        for(var j=0;j<data.length;j++){
            if(routes[i]===data[j].route){
                totalNumber++;
                var timeUsed=data[j].timeUsed
                totalTime+=timeUsed;
                if(maxTime<=timeUsed){maxTime=timeUsed;}
                if(minTime>=timeUsed){minTime=timeUsed;}
            }
        }
        countData.totalCount=totalNumber;
        countData.maxTime=maxTime;
        countData.minTime=minTime;
        countData.avgTime=totalTime/totalNumber;
        returnArray.push(countData);
    }
    return returnArray;
};