
__resources__["/__builtin__/sound.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
"use strict"; 
var globalClocker = require('clocker').globalClocker();
var createAudio = require('helper').createAudio;

var gAudioArrayMap = new Object();
var gIdentityAudioMap = new Object();
var gReclaimFrequency = 1000;
var lastReclaimTime = globalClocker.now();
var gVolumeProportion = 1;

/*
play:������Ƶ�ļ�
source:��Ƶ�ļ�·����
       ������Ƶ�ļ��Ѿ���������Ƶ�����У���ᴴ���µĶ��ǻ��ظ����á�
bLoop: �Ƿ�ѭ�����š�trueѭ����false��ѭ������������ֹͣ��
v:����������v�ķ�Χ [0, 1]��
return:����һ����Ƶ�ļ���identity��
*/
function play(source, bLoop, v)
{
  if(source == undefined)
  {
    console.log("sound play bad source param");
    return;
  }
  if(bLoop == undefined)
  {
    console.log("sound play no loop param");
    bLoop = false;
  }
  if(v == undefined)
  {
    console.log("sound play no volume param");
    v = 1;
  }
  
  var audioAry = gAudioArrayMap[source];
  var bFind = false;
  var audio;

  if(audioAry == null)
  {
    audioAry = {};
    gAudioArrayMap[source] = audioAry;
    audio = createAudio();
  }
  else
  {
    for(var identity in audioAry)
    {
      var audio = audioAry[identity];
      
      if(audio.paused == true || audio.ended == true)
      {
        bFind = true;
        break;
      }
    }
    if(bFind == false)
      audio = createAudio();
  }

  if(bFind == false)
    audio.src = source;
  else if(audio.paused == true)
  {
    //����currentTime��ʹaudio���ڴ�����������ֻ�е���Ƶ����ͣ�������²���ʱ���Ż����õ�ǰ�Ĳ��ŵ�ʱ�����㡣
    audio.currentTime = 0;
  }
  audio.loop = bLoop;
  audio.playVolume = v;
  audio.volume = v * gVolumeProportion;
  audio.play();
  audioAry[audio.identifier] = audio;
  
  //��audio����gIdentityMap����
  gIdentityAudioMap[audio.identifier] = audio;
  
  return audio.identifier;
}

/*
stop:ֹͣ������Ƶ��
identity:��Ƶ�ļ���identity��
*/
function stop(identity)
{
  var audio = gIdentityAudioMap[identity];
  
  if(audio == null)
    return;

  audio.pause();
}


/*
setVolume:������Ƶ�ļ���������
identity:��Ƶ�ļ���identity��
v:���ò��ŵ�������v�ķ�Χ [0, 1]��
*/
function setVolume(identity, v)
{
  var audio = gIdentityAudioMap[identity];
  
  if(audio == null)
    return;
  
  audio.playVolume = v;
  audio.volume = v * gVolumeProportion;
}

/*
setReclaimFrequency:����audio��Դ����Ƶ�ʡ�
fre:Ƶ��
*/
function setReclaimFrequency(fre)
{
  gReclaimFrequency = fre;
}

/*
reclaim:������Ƶ��Դ��
����Ƶ�ļ�û�б�ʹ�ù�������Ƶ��Դ�ᱻ���յ���
*/
function reclaim()
{
  var audioAry, audio;
  var nowTime = globalClocker.now();
  var bNullAudioAry = true;
  
  //û�дﵽ����Ƶ��
  if(nowTime - lastReclaimTime < gReclaimFrequency)
    return;
  
  lastReclaimTime = nowTime;
  
  //��������audio
  for(var source in gAudioArrayMap)
  {
    audioAry = gAudioArrayMap[source];
    bNullAudioAry = true;
    for(var identity in audioAry)
    {
      audio = audioAry[identity];
      if(audio.paused == true || audio.ended == true)
      {
        delete audioAry[identity];
        delete gIdentityAudioMap[audio.identifier];
      }
      bNullAudioAry = false;
    }
    if(bNullAudioAry == true)
      delete gAudioArrayMap[source];
  }
}

//����ģ�����Խӿ�
var _test = {
  /*
  isAudioReclaimed:���Ը�identity��������Ƶ��Դ�Ƿ��ѱ����ա�
  ����ֵ��true�ѱ����գ�falseδ�����ա�
  */
  isAudioReclaimed:function(identity)
  {
    if(gIdentityAudioMap[identity] != null)
      return false;
    return true;
  }
};

/*
setVolumeProportion:��������������Ĭ����1��
ͨ�����������������Ե�����Ƶ���ŵ�������С�����ŵ�ʵ���������� �������� * ���õĲ���������
���ù������������ڲ��ŵ���Ƶ�ļ��������µ���������
*/
function setVolumeProportion(p)
{
  if(p == undefined || p == gVolumeProportion)
  {
    console.log("setVolumeProportion param err");
    return;
  }
  
  var audio;
  
  for(var identity in gIdentityAudioMap)
  {
    audio = gIdentityAudioMap[identity];
    if(audio.paused == true || audio.ended == true)
      continue;
    audio.volume = audio.playVolume * p;
  }
  
  gVolumeProportion = p;
}

module.exports.play = play;
module.exports.stop = stop;
module.exports.setVolume = setVolume;
module.exports.reclaim = reclaim;
module.exports.setReclaimFrequency = setReclaimFrequency;
module.exports.setVolumeProportion = setVolumeProportion;
module.exports._test = _test;
}};