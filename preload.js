// const { readdirSync } = require('fs');
// const childProcess = require('child_process');

// function getDirAndFiles(source) {
//   let arr = readdirSync(source, { withFileTypes: true })
//   return {
//     dirs : arr.filter(dirent => dirent.isDirectory())
//           .map(dirent => dirent.name),
//     files : arr.filter(dirent => !dirent.isDirectory())
//           .map(dirent => dirent.name)
//   }
// }

// function openFolder(path) {
//   childProcess.exec('start "" "' + path + '"');
// }

// function createHTMLList(data) {
//   let list = document.getElementById("myList");
    
//   data.forEach((item)=>{
//     let li = document.createElement("li");
//     li.innerText = item;
//     list.appendChild(li);
//   })
// }

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  // console.log(getDirectories("./../"))
  // console.log(getFiles("./../"))
  // let results = getDirAndFiles("./../");
  // let results = getDirAndFiles("C:/_Data/OneDrive/_CMU/");
  

  // let arr = (results.dirs).concat(results.files);
  // let htmlList = createHTMLList(arr);
  // replaceText("my-text", htmlList);
  // console.log(htmlList);
})

