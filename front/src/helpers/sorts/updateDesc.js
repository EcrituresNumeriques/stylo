let sortByUpdateDesc = function(a, b) {
  let idA = a.updatedAt; // ignore upper and lowercase
  let idB = b.updatedAt; // ignore upper and lowercase
  if (idA > idB) {return -1;}
  if (idA < idB) {return 1;}
  return 0;
};
export default sortByUpdateDesc;
