import {handleExtraction} from '../server/worker.mjs';

export default {
 fetch(request){
  return handleExtraction(request,{
   GEMINI_API_KEY:process.env.GEMINI_API_KEY,
   GEMINI_MODEL:process.env.GEMINI_MODEL,
   VERCEL:process.env.VERCEL
  });
 }
};
