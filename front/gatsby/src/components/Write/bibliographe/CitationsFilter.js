export default (input) => {

const compare = (a,b) => {
  if (a.cle < b.cle)
    return -1;
  if (a.cle > b.cle)
    return 1;
  return 0;
}

const itemsAllowed = [
  "@spacer",
  "@book",
  "@article",
  "@incollection",
  "@phdthesis",
  "@misc",
  "@inproceedings",
  "@techreport",
  "@unpublished",
]
const regex = new RegExp('/(?='+itemsAllowed.join(')|(?=')+')/g')
const bib = input || ""

let entries = bib.split(regex)
  .filter((ref)=>(ref.match(/^@/g)))
  .map((ref)=>(ref.replace(/^\s+|\s+$/g, '')))
  .map((ref)=>({title:ref,cle:ref.match(/^@.+{(.+),/)[1]}))
  .sort(compare);

  return entries
}