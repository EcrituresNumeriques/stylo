let sortByIdDesc = function(a, b) {
  let idA = a.createdAt; // ignore upper and lowercase
  let idB = b.createdAt; // ignore upper and lowercase
  if (idA > idB) {return -1;}
  if (idA < idB) {return 1;}
  return 0;
};
export default sortByIdDesc;
