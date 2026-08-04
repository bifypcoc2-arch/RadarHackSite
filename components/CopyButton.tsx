"use client";
import {useState} from "react";import {Copy} from "./Icons";
export function CopyButton({value,label}:{value:string;label:string}){const[done,setDone]=useState(false);return <button className="icon-button" onClick={async()=>{await navigator.clipboard.writeText(value);setDone(true);setTimeout(()=>setDone(false),1500)}}><Copy/>{done?"Copied":label}</button>}
