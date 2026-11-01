import "dotenv/config";
import OpenAI from "openai";
import readline from "node:readline/promises";
import { vectorStore } from "./prepare.js";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function chat() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    while(true){
        const question = await rl.question("You:");
        if(question.toLowerCase() === "exit"){
            console.log("Exiting...");
            break;
        }

    // retrieval
    const relevantChunks = await vectorStore.similaritySearch(question,3);
    const context = relevantChunks.map(chunk => chunk.pageContent).join('\n\n');



    const systemPrompt =`You are an assistant  for question-answering tasks.Use the
     following relevant pieces of retrieved context to
      answer the question.If you don't know the answer, just say that you don't know, don't try to make up an answer.`


  const userquery =`Question: ${question}
  Relevant context: ${context}
  Answer: `;   
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userquery },
    ],
  });
  console.log(`Assistant: ${response.choices[0].message.content}`);
    }
rl.close();


}


chat();

