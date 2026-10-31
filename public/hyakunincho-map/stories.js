// まほろばの散策記録（まほブラ）：MAHOROBA JOURNAL の表紙・Instagram の動画・note の記事。2026-10-31 今西さん提供。
// Links are stored without the share-tracking query (?rpxt= etc.). Covers: journal/*.webp (1600px), originals in journal/original/ (not published).
const reel=id=>`https://www.instagram.com/reel/${id}/`;
export const STORIES=Object.freeze([
  {id:'no07-futabakan',spotId:'407e3a043cef8157869cceda5fc2cff1',issue:'MAHOROBA JOURNAL no.07',title:'時をかける、赤と光の螺旋。',place:'文化のみち二葉館',
    cover:{src:'./journal/no07-futabakan.webp',original:'./journal/original/no07-futabakan.webp',width:1600,height:913,alt:'MAHOROBA JOURNAL no.07の表紙。オレンジ色の瓦屋根と石の柱の車寄せがある二葉館の外観写真に「時をかける、赤と光の螺旋。」の文字。'},
    instagram:reel('DUnnfSkiSjB'),note:'https://note.com/mahoroba_office/n/n1e256780b6b3'},
  {id:'no09-shumokukan',spotId:'407e3a043cef8125bdb2c9ac406232af',issue:'MAHOROBA JOURNAL no.09',title:'記憶が息づく洋館',place:'文化のみち橦木館',
    cover:{src:'./journal/no09-shumokukan.webp',original:'./journal/original/no09-shumokukan.webp',width:1600,height:913,alt:'MAHOROBA JOURNAL no.09の表紙。ガラス戸が続く板張りの縁側の奥に掛け軸が見える写真に「記憶が息づく洋館」の文字。'},
    instagram:reel('DVPT0jskxhZ'),note:'https://note.com/mahoroba_office/n/n50ed322fb7ef'},
  {id:'bunka-no-michi',spotId:null,title:'文化のみちを歩いた',place:'文化のみち（白壁・主税・橦木ほか）',instagram:reel('DFG03MQzXhJ')},
  {id:'tokugawaen',spotId:'407e3a043cef81139f9df6aaf1d15993',title:'徳川園を歩いた',place:'徳川園',instagram:reel('DBcgCEctuwM')}
].map(s=>Object.freeze(s)));
export const storiesFor=spotId=>STORIES.filter(s=>s.spotId===spotId);
