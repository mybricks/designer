export function versionGreaterThan(version1, version2) {
  const newVersion1 = `${version1}`.split('.').length < 3 ? `${version1}`.concat('.0') : `${version1}`;
  const newVersion2 = `${version2}`.split('.').length < 3 ? `${version2}`.concat('.0') : `${version2}`;
  function toNum(a){
    const c = a.toString().split('.');
    const num_place = ["", "0", "00", "000", "0000"],
      r = num_place.reverse();
    for (let i = 0; i < c.length; i++){
      const len=c[i].length;
      c[i]=r[len]+c[i];
    }
    return c.join('');
  }

  function checkPlugin(a, b) {
    const numA = toNum(a);
    const numB = toNum(b);
    return numA > numB ? 1 : numA < numB ? -1 : 0;
  }
  return checkPlugin(newVersion1 ,newVersion2);
}