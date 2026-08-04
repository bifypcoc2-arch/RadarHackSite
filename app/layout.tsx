import type {Metadata} from "next";import {Saira,Saira_Condensed} from "next/font/google";import "./globals.css";
const saira=Saira({subsets:["latin","cyrillic"],variable:"--font-saira"});const condensed=Saira_Condensed({subsets:["latin"],weight:["500","600","700"],variable:"--font-condensed"});
export const metadata:Metadata={title:{default:"Web Radar — Live tactical intelligence",template:"%s · Web Radar"},description:"Fast, precise web-based radar for live match intelligence."};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ru" className={`${saira.variable} ${condensed.variable}`}><body>{children}</body></html>}
