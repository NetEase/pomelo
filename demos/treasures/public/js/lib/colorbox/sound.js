
__resources__["/__builtin__/sound.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var globalClocker = require('clocker').globalClocker();
var createAudio = require('helper').createAudio;

var gIdentityAudioMap = new Object();
var gReclaimFrequency = 1000;
var lastReclaimTime = globalClocker.now();

/*
play:������Ƶ�ļ�
source:��Ƶ�ļ�·����
       ���ܸ���Ƶ�ļ��Ƿ��Ѿ���������Ƶ�����У��������´���audio������ԭ������chrome�������£�server��������һֱ����һ�� audio ������ܹ��ظ����ţ�ֻ�ܴ����µ�audio����
bLoop: �Ƿ�ѭ�����š�trueѭ����false��ѭ������������ֹͣ��
v:����������v�ķ�Χ [0, 1]��
return:����һ����Ƶ�ļ���identity��
*/
function play(source, bLoop, v)
{
  var audio = createAudio();

  audio.src = source;
  audio.loop = bLoop;
  audio.volume = v;
  audio.play();
  
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
  
  audio.volume = v;
}

/*
setReclaimFrequency:����audio��Դ����Ƶ�ʡ�
fre:Ƶ��.
*/
function setReclaimFrequency(fre)
{
  gReclaimFrequency = fre;
}

/*
reclaim:������Ƶ��Դ��
����Ƶ�ļ��Ѿ�ֹͣ���߲������ɣ�����Ƶ��Դ�ᱻ���յ���
*/
function reclaim()
{
  var nowTime = globalClocker.now();
  var audio;
  
  //û�дﵽ����Ƶ��
  if(nowTime - lastReclaimTime < gReclaimFrequency)
    return;
  
  lastReclaimTime = nowTime;
  
  //��������audio
  for(var identity in gIdentityAudioMap)
  {
    audio = gIdentityAudioMap[identity];
    if(audio.paused == true || audio.ended == true)
      delete gIdentityAudioMap[identity];
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

module.exports.play = play;
module.exports.stop = stop;
module.exports.setVolume = setVolume;
module.exports.reclaim = reclaim;
module.exports.setReclaimFrequency = setReclaimFrequency;
module.exports._test = _test;
}};