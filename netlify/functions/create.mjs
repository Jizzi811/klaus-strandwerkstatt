const url='https://integrate.api.nvidia.com/v1/chat/completions';
const tasks={
workshop:'Gib eine sichere, einfache Reparaturhilfe. Beginne mit einer kurzen Einschätzung, dann Werkzeugliste und nummerierte Schritte. Weise klar darauf hin, wenn Fachbetrieb, Stromabschaltung oder Schutzkleidung nötig sind. Erfinde keine Sicherheit.',
mining:'Forme die Erinnerung behutsam zu einer lebendigen Ich-Erzählung. Bewahre alle genannten Fakten und markiere Unsicherheiten. Stelle am Ende zwei freundliche Erinnerungsfragen.',
joke:'Erstelle fünf kurze, gutmütige deutsche Witze oder Sprüche passend zu den Angaben. Nicht beleidigend, diskriminierend oder derb.',
recipe:'Erstelle aus den Zutaten zwei einfache Feierabendgerichte. Gib für das beste Gericht Mengen, kurze Schritte und eine alkoholfreie Getränkeidee an.',
media:'Empfiehl jeweils drei passende Bücher, Filme oder Musikrichtungen. Erfinde keine Titel; erkläre knapp, warum sie passen.',
activity:'Schlage drei gemütliche Freizeitideen passend zu Wetter, Radfahren, Schwimmen oder Fotografie vor. Keine medizinischen Leistungsversprechen.',
card:'Erstelle zuerst einen persönlichen Kartentext und danach eine genaue Bildbeschreibung für eine humorvolle, hochwertige Grußkarte.',
free:'Erstelle eine klare hochwertige Bildbeschreibung aus der freien Idee.'
};
const out=(s,b)=>({statusCode:s,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(b)});
export async function handler(e){
  if(e.httpMethod!=='POST')return out(405,{error:'Nur POST'});
  if(!process.env.NVIDIA_API_KEY)return out(503,{error:'Der NVIDIA_API_KEY fehlt noch in Netlify.'});
  let b;try{b=JSON.parse(e.body||'{}')}catch{return out(400,{error:'Ungültige Anfrage'})}
  const task=tasks[b.task]||tasks.free,input=String(b.input||'').slice(0,6000);
  if(!input.trim())return out(400,{error:'Bitte fülle mindestens ein Feld aus.'});
  try{
    const r=await fetch(url,{method:'POST',headers:{authorization:`Bearer ${process.env.NVIDIA_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:process.env.NVIDIA_MODEL||'nvidia/nemotron-3-nano-30b-a3b',messages:[{role:'system',content:`Du bist ein freundlicher, bodenständiger digitaler Kumpel für Klaus. Sprich klares Deutsch, respektvoll, praktisch und mit trockenem Humor. ${task}`},{role:'user',content:input}],temperature:.7,max_tokens:1100})});
    const d=await r.json();if(!r.ok)throw Error(d.message||'Der Assistent antwortet gerade nicht');
    return out(200,{text:d.choices?.[0]?.message?.content||'Gerade keine passende Idee gefunden.'});
  }catch(x){return out(502,{error:x.message})}
}
