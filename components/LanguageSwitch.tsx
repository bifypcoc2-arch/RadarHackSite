"use client";
import {useRouter} from "next/navigation";
export function LanguageSwitch({locale}:{locale:"ru"|"en"}){const router=useRouter();async function setLocale(next:string){await fetch("/api/locale",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({locale:next})});router.refresh()}return <button className="lang" onClick={()=>setLocale(locale==="ru"?"en":"ru")} aria-label="Switch language"><span className={locale==="ru"?"active":""}>RU</span><i/><span className={locale==="en"?"active":""}>EN</span></button>}
