// Single-line cathode shapes keep the display readable as real countdown data.
const cathodes:Record<string,string>={
 '0':'M30 10 C15 10 11 23 11 49 C11 76 15 89 30 89 C45 89 49 76 49 49 C49 23 45 10 30 10Z',
 '1':'M17 26 L31 11 L31 88 M18 89 H44',
 '2':'M11 28 C11 5 49 3 49 28 C49 43 36 52 26 62 C16 72 11 78 11 88 H49',
 '3':'M12 19 C24 6 46 7 47 27 C48 40 38 48 25 48 C41 47 50 57 48 73 C46 92 23 94 11 80',
 '4':'M40 89 V11 L10 63 H51',
 '5':'M47 11 H14 L12 47 C32 36 49 46 49 67 C49 91 24 97 11 80',
 '6':'M44 15 C29 2 10 15 10 51 C10 75 15 89 30 89 C43 89 49 80 49 65 C49 47 32 40 12 54',
 '7':'M10 11 H49 L23 89',
 '8':'M30 49 C4 41 9 10 30 10 C51 10 56 41 30 49 C2 57 6 89 30 89 C54 89 58 57 30 49Z',
 '9':'M16 83 C31 97 50 84 50 48 C50 24 45 10 30 10 C17 10 11 19 11 34 C11 52 28 59 48 45'
};
export function NixieDigit({value}:{value:string}){
 return <span className="nixie-tube" aria-hidden="true">
  <img className="nixie-housing" src="/nixie-tube-dark.png" alt="" width="1024" height="1536" draggable="false"/>
  <svg className="nixie-cathodes" viewBox="0 0 60 100" focusable="false">
   <path className="nixie-dormant" d={cathodes['8']}/>
   <g className="nixie-active" key={value}><path className="nixie-lit" d={cathodes[value]??cathodes['0']}/><path className="nixie-core" d={cathodes[value]??cathodes['0']}/></g>
  </svg>
 </span>;
}
