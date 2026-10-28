"use client";
import {createContext,useContext} from "react";
import type {Locale} from "../../lib/i18n/config";
import type {Messages} from "../../lib/i18n/messages";

const LocaleContext=createContext<{locale:Locale;messages:Messages}|null>(null);
export function LocaleProvider({locale,messages,children}:{locale:Locale;messages:Messages;children:React.ReactNode}) {
 return <LocaleContext.Provider value={{locale,messages}}>{children}</LocaleContext.Provider>;
}
export function useLocale() {
 const value=useContext(LocaleContext);
 if(!value)throw new Error("LocaleProvider is required");
 return value;
}
