import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import {PineconeStore} from "@langchain/pinecone";
import {Pinecone as PineconeClient} from "@pinecone-database/pinecone";
import "dotenv/config";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
 
});



//we can also use mongodb for this vector store but we will use pinecone for now
const pinecone = new PineconeClient({apiKey: process.env.PINECONE_API_KEY, environment: "us-east1-gcp"});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);


export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {

    pineconeIndex,
    maxConcurrency:5,
});



export async  function indexTheDocument(filePath){
   const loader = new PDFLoader(filePath,{splitPages:false});
   const docs = await loader.load();
//    console.log(docs[0].pageContent);
//    console.log(docs.length);

   const textSplitter = new RecursiveCharacterTextSplitter({
     chunkSize: 500,
     chunkOverlap: 100,

});
const texts = await textSplitter.splitText(docs[0].pageContent);

const documents =texts.map((chunk)=>{
    return {
        pageContent: chunk,
        metadata: docs[0].metadata
    }
})





// console.log("Chunks:", documents.length);
// console.log(documents[0].pageContent);
await vectorStore.addDocuments(documents);
  
}