export function createRecognizer(onText: (text: string, final: boolean) => void) {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = 'pt-BR';
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (event) => {
    let transcript = '';
    let final = false;
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) final = true;
    }
    onText(transcript, final);
  };
  return rec;
}
