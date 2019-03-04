export default (input) => {

const compare = (a,b) => {
  if (a.key < b.key)
    return -1;
  if (a.key > b.key)
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
  .map((ref)=>({title:ref,key:ref.match(/^@.+{(.+),/)[1]}))
  .sort(compare);

  return entries
}