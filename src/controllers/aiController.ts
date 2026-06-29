
import type { Response } from "express";
import openai from "../openai";


export const summarizeNote = async(
req:any,
res:Response
)=>{

try{


const response =
await openai.responses.create({

model:"gpt-5-mini",

input:
`
Summarize this note:

${req.body.content}

`

});


res.json({

summary:
response.output_text

});


}
catch(error){

console.log(error);

res.status(500).json({
message:"AI failed"
});

}


}