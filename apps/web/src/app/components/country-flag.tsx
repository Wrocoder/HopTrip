import Image, {type StaticImageData} from "next/image";
import AL from "../../assets/flags/al.svg";
import AT from "../../assets/flags/at.svg";
import BE from "../../assets/flags/be.svg";
import BG from "../../assets/flags/bg.svg";
import CH from "../../assets/flags/ch.svg";
import CY from "../../assets/flags/cy.svg";
import CZ from "../../assets/flags/cz.svg";
import DE from "../../assets/flags/de.svg";
import DK from "../../assets/flags/dk.svg";
import EE from "../../assets/flags/ee.svg";
import ES from "../../assets/flags/es.svg";
import FI from "../../assets/flags/fi.svg";
import FR from "../../assets/flags/fr.svg";
import GB from "../../assets/flags/gb.svg";
import GE from "../../assets/flags/ge.svg";
import GR from "../../assets/flags/gr.svg";
import HR from "../../assets/flags/hr.svg";
import HU from "../../assets/flags/hu.svg";
import IE from "../../assets/flags/ie.svg";
import IT from "../../assets/flags/it.svg";
import LT from "../../assets/flags/lt.svg";
import LV from "../../assets/flags/lv.svg";
import MA from "../../assets/flags/ma.svg";
import MD from "../../assets/flags/md.svg";
import ME from "../../assets/flags/me.svg";
import MT from "../../assets/flags/mt.svg";
import NL from "../../assets/flags/nl.svg";
import NO from "../../assets/flags/no.svg";
import PL from "../../assets/flags/pl.svg";
import PT from "../../assets/flags/pt.svg";
import RO from "../../assets/flags/ro.svg";
import SE from "../../assets/flags/se.svg";
import SK from "../../assets/flags/sk.svg";
const flags:Record<string,StaticImageData>={AL,AT,BE,BG,CH,CY,CZ,DE,DK,EE,ES,FI,FR,GB,GE,GR,HR,HU,IE,IT,LT,LV,MA,MD,ME,MT,NL,NO,PL,PT,RO,SE,SK};
const countries=new Intl.DisplayNames(["pl"],{type:"region"});

export function CountryFlag({code}:{code?:string}) {
  const normalized=code?.trim().toUpperCase() ?? "";
  const flag=flags[normalized];
  if(!flag)return null;
  return <Image className="country-flag" src={flag} width={24} height={18}
    alt="" title={countries.of(normalized)} unoptimized/>;
}