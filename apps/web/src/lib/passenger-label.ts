/** Accusative phrase for the instruction “U partnera ustaw …”. */
export function passengerInstruction(people:string,adultsOnly:boolean) {
 if(!/^[1-9]\d*$/.test(people) || Number(people)>50)return "U partnera ustaw skład grupy.";
 const n=Number(people);
 const label=adultsOnly ? (n===1 ? "dorosłego" : "dorosłych")
  : n===1 ? "osobę" : n%10>=2 && n%10<=4 && !(n%100>=12 && n%100<=14) ? "osoby" : "osób";
 return `U partnera ustaw ${n} ${label}.${adultsOnly ? "" : " Sprawdź dorosłych i dzieci."}`;
}
