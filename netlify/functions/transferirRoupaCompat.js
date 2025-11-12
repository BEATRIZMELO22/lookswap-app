// netlify/functions/transferirRoupaCompat.js
const VERSION='transferirRoupa@2025-11-12-compat';
const ALLOWED_ORIGIN=process.env.ALLOWED_ORIGIN||'https://lookswap.netlify.app';
const MAX_BYTES=Number(process.env.MAX_BYTES||8*1024*1024);
const ALLOWED_MIMES=new Set(['image/png','image/jpeg','image/webp']);

function json(code,obj,h={}){return{statusCode:code,headers:{
  'Content-Type':'application/json','Access-Control-Allow-Origin':ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type',
  'Access-Control-Max-Age':'86400','Vary':'Origin',...h},body:JSON.stringify(obj)}}
const err=(s,c,m,extra={})=>json(s,{ok:false,errorCode:c,message:m,...extra});
function pick(o,ks){for(const k of ks){const v=o&&o[k];if(typeof v==='string'&&v.trim())return v}}
function parseDataUrlStrict(u){
  if(typeof u!=='string'||!u.startsWith('data:')){const e=new Error('INVALID_DATA_URL');e.code='INVALID_DATA_URL';throw e}
  const i=u.indexOf(','); if(i===-1){const e=new Error('INVALID_DATA_URL');e.code='INVALID_DATA_URL';throw e}
  const meta=u.slice(5,i); const semi=meta.indexOf(';'); const mime=semi===-1?meta:meta.slice(0,semi);
  const isB64=semi!==-1?meta.slice(semi+1).toLowerCase()==='base64':false;
  if(!mime||!isB64){const e=new Error('INVALID_DATA_URL');e.code='INVALID_DATA_URL';throw e}
  if(!ALLOWED_MIMES.has(mime)){const e=new Error('UNSUPPORTED_MIME');e.code='UNSUPPORTED_MIME';e.mime=mime;throw e}
  let buf; try{buf=Buffer.from(u.slice(i+1),'base64')}catch{const e=new Error('INVALID_BASE64');e.code='INVALID_BASE64';throw e}
  if(!buf||buf.length===0){const e=new Error('EMPTY_IMAGE');e.code='EMPTY_IMAGE';throw e}
  return {mime,buf}
}
const stubTinyPng=()=>'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z8DwHwAFegJ0NQn1VwAAAABJRU5ErkJggg==';

exports.handler=async(event,context)=>{
  const started=Date.now();
  if(event.httpMethod==='OPTIONS')return json(200,{ok:true,version:VERSION});
  if(event.httpMethod!=='POST')return err(405,'METHOD_NOT_ALLOWED','Use POST',{version:VERSION});
  try{
    if(!event.body)return err(400,'EMPTY_BODY','Body ausente',{version:VERSION});
    const raw=event.isBase64Encoded?Buffer.from(event.body,'base64').toString('utf8'):event.body;
    const rawBytes=Buffer.byteLength(raw,'utf8'); if(rawBytes>MAX_BYTES)return err(413,'PAYLOAD_TOO_LARGE','Payload muito grande',{version:VERSION});
    let data; try{data=JSON.parse(raw)}catch{return err(400,'INVALID_JSON','JSON invalido',{version:VERSION})}
    const baseImage=pick(data,['baseImage','image','imageA','photo','inputImage']);
    const garmentImage=pick(data,['garmentImage','imageB','garment','overlay','overlayImage']);
    const ratioStr=pick(data,['ratio','ar','aspectRatio','proporcao'])||'9:16';
    const keysPresent=Object.keys(data||{});
    if(!baseImage||!garmentImage)return err(400,'MISSING_FIELDS','Envie baseImage e garmentImage (dataURL).',{version:VERSION,keysPresent});
    const m=/^(\d{1,3}):(\d{1,3})$/.exec(String(ratioStr)); if(!m||Number(m[1])===0||Number(m[2])===0)return err(422,'INVALID_RATIO','Proporcao deve ser N:N, ex. 9:16.',{version:VERSION,ratioReceived:ratioStr});
    let imgA,imgB; try{imgA=parseDataUrlStrict(baseImage);imgB=parseDataUrlStrict(garmentImage)}catch(e){const code=e&&e.code?e.code:'INVALID_DATA_URL';const msg=code==='UNSUPPORTED_MIME'?'MIME nao suportado: '+e.mime+'. Use image/png, image/jpeg ou image/webp.':'dataURL invalida';return err(400,code,msg,{version:VERSION})}
    console.log(JSON.stringify({at:'transferirRoupaCompat.incoming',version:VERSION,lenRaw:rawBytes,baseKB:Math.round(imgA.buf.length/1024),garmentKB:Math.round(imgB.buf.length/1024),mimes:[imgA.mime,imgB.mime],ratio:ratioStr,reqId:(context&&context.awsRequestId)||null}));
    const image=stubTinyPng(); const durationMs=Date.now()-started;
    console.log(JSON.stringify({at:'transferirRoupaCompat.done',version:VERSION,durationMs,reqId:(context&&context.awsRequestId)||null}));
    return json(200,{ok:true,message:'OK',image,durationMs,version:VERSION})
  }catch(e){
    console.error('UNCAUGHT',JSON.stringify({version:VERSION,message:e&&e.message,stack:String((e&&e.stack)||'').split('\n').slice(0,3).join(' | ')}));
    return err(500,'INTERNAL_ERROR','Falha interna',{version:VERSION})
  }
}
'
Set-Content -Path $path -Value $code -Encoding UTF8
git add $path
git commit -m "feat(function): add transferirRoupaCompat robust handler + stub"
git push origin main

$URL="https://lookswap.netlify.app/.netlify/functions/transferirRoupaCompat"
"OPTIONS:"; Invoke-RestMethod -Uri $URL -Method Options | ConvertTo-Json
$tiny="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z8DwHwAFegJ0NQn1VwAAAABJRU5ErkJggg=="
$body=@{baseImage=$tiny;garmentImage=$tiny;ratio="9:16"}|ConvertTo-Json -Depth 5
"POST:"; Invoke-RestMethod -Uri $URL -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5
Set-Location "C:\Users\marco\OneDrive\Área de Trabalho\lookswap-app"

$path = "netlify\functions\transferirRoupaCompat.js"
$code = @'
// netlify/functions/transferirRoupaCompat.js
const VERSION='transferirRoupa@2025-11-12-compat';
const ALLOWED_ORIGIN=process.env.ALLOWED_ORIGIN||'https://lookswap.netlify.app';
const MAX_BYTES=Number(process.env.MAX_BYTES||8*1024*1024);
const ALLOWED_MIMES=new Set(['image/png','image/jpeg','image/webp']);

function json(code,obj,h={}){return{statusCode:code,headers:{
  'Content-Type':'application/json','Access-Control-Allow-Origin':ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type',
  'Access-Control-Max-Age':'86400','Vary':'Origin',...h},body:JSON.stringify(obj)}}
const err=(s,c,m,extra={})=>json(s,{ok:false,errorCode:c,message:m,...extra});
function pick(o,ks){for(const k of ks){const v=o&&o[k];if(typeof v==='string'&&v.trim())return v}}
function parseDataUrlStrict(u){
  if(typeof u!=='string'||!u.startsWith('data:')){const e=new Error('INVALID_DATA_URL');e.code='INVALID_DATA_URL';throw e}
  const i=u.indexOf(','); if(i===-1){const e=new Error('INVALID_DATA_URL');e.code='INVALID_DATA_URL';throw e}
  const meta=u.slice(5,i); const semi=meta.indexOf(';'); const mime=semi===-1?meta:meta.slice(0,semi);
  const isB64=semi!==-1?meta.slice(semi+1).toLowerCase()==='base64':false;
  if(!mime||!isB64){const e=new Error('INVALID_DATA_URL');e.code='INVALID_DATA_URL';throw e}
  if(!ALLOWED_MIMES.has(mime)){const e=new Error('UNSUPPORTED_MIME');e.code='UNSUPPORTED_MIME';e.mime=mime;throw e}
  let buf; try{buf=Buffer.from(u.slice(i+1),'base64')}catch{const e=new Error('INVALID_BASE64');e.code='INVALID_BASE64';throw e}
  if(!buf||buf.length===0){const e=new Error('EMPTY_IMAGE');e.code='EMPTY_IMAGE';throw e}
  return {mime,buf}
}
const stubTinyPng=()=>'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z8DwHwAFegJ0NQn1VwAAAABJRU5ErkJggg==';

exports.handler=async(event,context)=>{
  const started=Date.now();
  if(event.httpMethod==='OPTIONS')return json(200,{ok:true,version:VERSION});
  if(event.httpMethod!=='POST')return err(405,'METHOD_NOT_ALLOWED','Use POST',{version:VERSION});
  try{
    if(!event.body)return err(400,'EMPTY_BODY','Body ausente',{version:VERSION});
    const raw=event.isBase64Encoded?Buffer.from(event.body,'base64').toString('utf8'):event.body;
    const rawBytes=Buffer.byteLength(raw,'utf8'); if(rawBytes>MAX_BYTES)return err(413,'PAYLOAD_TOO_LARGE','Payload muito grande',{version:VERSION});
    let data; try{data=JSON.parse(raw)}catch{return err(400,'INVALID_JSON','JSON invalido',{version:VERSION})}
    const baseImage=pick(data,['baseImage','image','imageA','photo','inputImage']);
    const garmentImage=pick(data,['garmentImage','imageB','garment','overlay','overlayImage']);
    const ratioStr=pick(data,['ratio','ar','aspectRatio','proporcao'])||'9:16';
    const keysPresent=Object.keys(data||{});
    if(!baseImage||!garmentImage)return err(400,'MISSING_FIELDS','Envie baseImage e garmentImage (dataURL).',{version:VERSION,keysPresent});
    const m=/^(\d{1,3}):(\d{1,3})$/.exec(String(ratioStr)); if(!m||Number(m[1])===0||Number(m[2])===0)return err(422,'INVALID_RATIO','Proporcao deve ser N:N, ex. 9:16.',{version:VERSION,ratioReceived:ratioStr});
    let imgA,imgB; try{imgA=parseDataUrlStrict(baseImage);imgB=parseDataUrlStrict(garmentImage)}catch(e){const code=e&&e.code?e.code:'INVALID_DATA_URL';const msg=code==='UNSUPPORTED_MIME'?'MIME nao suportado: '+e.mime+'. Use image/png, image/jpeg ou image/webp.':'dataURL invalida';return err(400,code,msg,{version:VERSION})}
    console.log(JSON.stringify({at:'transferirRoupaCompat.incoming',version:VERSION,lenRaw:rawBytes,baseKB:Math.round(imgA.buf.length/1024),garmentKB:Math.round(imgB.buf.length/1024),mimes:[imgA.mime,imgB.mime],ratio:ratioStr,reqId:(context&&context.awsRequestId)||null}));
    const image=stubTinyPng(); const durationMs=Date.now()-started;
    console.log(JSON.stringify({at:'transferirRoupaCompat.done',version:VERSION,durationMs,reqId:(context&&context.awsRequestId)||null}));
    return json(200,{ok:true,message:'OK',image,durationMs,version:VERSION})
  }catch(e){
    console.error('UNCAUGHT',JSON.stringify({version:VERSION,message:e&&e.message,stack:String((e&&e.stack)||'').split('\n').slice(0,3).join(' | ')}));
    return err(500,'INTERNAL_ERROR','Falha interna',{version:VERSION})
  }
}
