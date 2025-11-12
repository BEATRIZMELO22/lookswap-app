// netlify/functions/transferirRoupa.js
const ALLOWED_ORIGIN = 'https://lookswap.netlify.app';
function resp(code, obj){
  return { statusCode: code, headers:{
    'Content-Type':'application/json','Access-Control-Allow-Origin':ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Max-Age':'86400','Vary':'Origin'
  }, body: JSON.stringify(obj) };
}
exports.handler = async (event)=>{
  if (event.httpMethod==='OPTIONS') return resp(200,{ok:true,version:'ping@1'});
  if (event.httpMethod!=='POST')   return resp(405,{ok:false,errorCode:'METHOD_NOT_ALLOWED'});
  const raw = event.isBase64Encoded ? Buffer.from(event.body||'','base64').toString('utf8') : (event.body||'');
  return resp(200,{ok:true,version:'ping@1',len:Buffer.byteLength(raw,'utf8')});
};
