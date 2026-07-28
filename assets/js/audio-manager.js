
class AudioManager{
 constructor(manifest={}){this.manifest=manifest;this.current=null;}
 async play(id,text,btn){
   if(this.current){this.current.pause();this.current=null;}
   document.querySelectorAll('.audio-btn.playing').forEach(x=>x.classList.remove('playing'));
   if(btn) btn.classList.add('playing');
   const src=this.manifest[id];
   if(src){
     try{
       const a=new Audio(src); this.current=a;
       a.onended=()=>btn&&btn.classList.remove('playing');
       a.onerror=()=>this.tts(text,btn);
       await a.play(); return;
     }catch(e){}
   }
   this.tts(text,btn);
 }
 tts(text,btn){
   if(!('speechSynthesis' in window)){alert('Trình duyệt không hỗ trợ TTS.');return;}
   speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance(text); u.lang='zh-CN'; u.rate=.82;
   u.onend=()=>btn&&btn.classList.remove('playing');
   speechSynthesis.speak(u);
 }
}
