function filtering(arr, obj) {
  return arr.filter((element) => {
    let objectKeys = Object.keys(obj);
    for (let key of objectKeys) {
      if (!element[key] || element[key] != obj[key]) return false;
    }
    return true;
  });
}

console.log(
  filtering([{ a: 1, b: 2, c: 3, d: 9999 }], { a: 1, b: 9999, c: 3 })
);
