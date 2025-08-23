import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
//const pdfUrl="https://incredible-weasel-365.convex.cloud/api/storage/7aa17abf-f597-48a0-97e1-a7e5a1b02529"
export async function GET(req){

    const reqUrl=req.url;
    const {searchParams} = new URL(reqUrl);
    const pdfUrl=searchParams.get('pdfurl');
    console.log(pdfUrl);
    //Load PDF File
    const response = await fetch(pdfUrl);
    const blob = await response.blob();
    const loader = new WebPDFLoader(blob);

    const docs=await loader.load();

    let pdfTextContent=''
    docs.forEach(doc=>{
        pdfTextContent+=doc.pageContent;
    });

    //2. Splitting text into smaller chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 20,
    });
    const output = await splitter.createDocuments([pdfTextContent]);
    let splitterList=[];
    output.forEach(doc=>{
        splitterList.push(doc.pageContent)
    })
    return NextResponse.json({result:splitterList})
}