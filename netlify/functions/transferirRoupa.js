const VERSION = 'transferirRoupa@2025-11-12-compat';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://lookswap.netlify.app';
const MAX_BYTES = Number(process.env.MAX_BYTES || 8 * 1024 * 1024);
const ALLOWED_MIMES = new Set(['image/png','image/jpeg','image/webp']);

function json(statusCode, bodyObj, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
      ...extraHeaders,
    },
    body: JSON.stringify(bodyObj),
  };
}
const error = (status, code, message, extra={}) => json(status, { ok:false, errorCode:code, message, ...extra });

function pick(obj, keys){ for(const k of keys){ const v=obj?.[k]; if(typeof v==='string'&&v.trim()) return v; } }

function parseDataUrlStrict(dataUrl){
  if(typeof dataUrl!=='string' || !dataUrl.startsWith('data:')){ const e=new Error('INVALID_DATA_URL'); e.code='INVALID_DATA_URL'; throw e;}
  const commaIdx = dataUrl.indexOf(','); if(commaIdx===-1){ const e=new Error('INVALID_DATA_URL'); e.code='INVALID_DATA_URL'; throw e; }
  const meta = dataUrl.slice(5, commaIdx);
  const base64Part = dataUrl.slice(commaIdx+1);
  const semiIdx = meta.indexOf(';');
  const mime = semiIdx===-1 ? meta : meta.slice(0, semiIdx);
  const isB64 = semiIdx!==-1 ? meta.slice(semiIdx+1).toLowerCase()==='base64' : false;
  if(!mime || !isB64){ const e=new Error('INVALID_DATA_URL'); e.code='INVALID_DATA_URL'; throw e; }
  if(!ALLOWED_MIMES.has(mime)){ const e=new Error('UNSUPPORTED_MIME'); e.code='UNSUPPORTED_MIME'; e.mime=mime; throw e; }
  let buf; try{ buf=Buffer.from(base64Part,'base64'); }catch{ const e=new Error('INVALID_BASE64'); e.code='INVALID_BASE64'; throw e; }
  if(!buf || buf.length===0){ const e=new Error('EMPTY_IMAGE'); e.code='EMPTY_IMAGE'; throw e; }
  return { mime, buf };
}
const stubTinyPng = ()=>'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z8DwHwAFegJ0NQn1VwAAAABJRU5ErkJggg==';

exports.handler = async (event, context) => {
  const started = Date.now();
  if(event.httpMethod==='OPTIONS') return json(200, { ok:true, version: VERSION });
  if(event.httpMethod!=='POST') return error(405,'METHOD_NOT_ALLOWED','Use POST',{version:VERSION});

  try{
    if(!event.body) return error(400,'EMPTY_BODY','Body ausente',{version:VERSION});

    const raw = event.isBase64Encoded ? Buffer.from(event.body,'base64').toString('utf8') : event.body;
    const rawBytes = Buffer.byteLength(raw,'utf8');
    if(rawBytes>MAX_BYTES) return error(413,'PAYLOAD_TOO_LARGE','Payload muito grande',{version:VERSION});

    let data; try{ data=JSON.parse(raw);}catch{ return error(400,'INVALID_JSON','JSON inválido',{version:VERSION}); }

    const baseImage = pick(data,['baseImage','image','imageA','photo','inputImage']);
    const garmentImage = pick(data,['garmentImage','imageB','garment','overlay','overlayImage']);
    const ratioStr = pick(data,['ratio','ar','aspectRatio','proporcao']) || '9:16';

    const keysPresent = Object.keys(data||{});
    if(!baseImage || !garmentImage){
      return error(400,'MISSING_FIELDS','Envie baseImage e garmentImage (dataURL).',{version:VERSION, keysPresent});
    }

    const m = /^(\d{1,3}):(\d{1,3})$/.exec(String(ratioStr));
    if(!m || Number(m[1])===0 || Number(m[2])===0){
      return error(422,'INVALID_RATIO','Proporção deve ser N:N, ex. 9:16.',{version:VERSION, ratioReceived:ratioStr});
    }

    let imgA, imgB;
    try{ imgA=parseDataUrlStrict(baseImage); imgB=parseDataUrlStrict(garmentImage); }
    catch(e){
      const code=e?.code||'INVALID_DATA_URL';
      const msg = code==='UNSUPPORTED_MIME' ? ('MIME não suportado: ' + e.mime + '. Use image/png, image/jpeg ou image/webp.')MIME não suportado: ${e.mime}. Use image/png, image/jpeg ou image/webp.`
        : 'dataURL inválida';
      return error(400, code, msg, {version:VERSION});
    }

    console.log(JSON.stringify({
      at:'transferirRoupa.incoming', version:VERSION,
      lenRaw: rawBytes,
      baseKB: Math.round(imgA.buf.length/1024),
      garmentKB: Math.round(imgB.buf.length/1024),
      mimes:[imgA.mime,imgB.mime],
      ratio: ratioStr,
      reqId: context?.awsRequestId || null,
    }));

    const resultDataUrl = stubTinyPng();
    const durationMs = Date.now()-started;

    console.log(JSON.stringify({ at:'transferirRoupa.done', version:VERSION, durationMs, reqId: context?.awsRequestId || null }));
    return json(200,{ ok:true, message:'OK', image:resultDataUrl, durationMs, version:VERSION });
  }catch(err){
    console.error('UNCAUGHT', JSON.stringify({
      version:VERSION,
      message: err?.message,
      stack: String(err?.stack||'').split('\n').slice(0,3).join(' | '),
    }));
    return error(500,'INTERNAL_ERROR','Falha interna',{version:VERSION});
  }
};

