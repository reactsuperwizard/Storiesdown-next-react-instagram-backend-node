function forceDownload(blob, filename) {
  let a = document.createElement("a");
  a.download = filename;
  a.href = blob;
  // For Firefox https://stackoverflow.com/a/32226068
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default (e, url) => {
  e.preventDefault();

  let filename = url.split("\\").pop().split("/").pop().split("?").shift();
  fetch(url, {
    headers: new Headers({
      Origin: window.location.origin,
    }),
    mode: "cors",
  })
    .then((response) => response.blob())
    .then((blob) => {
      let blobUrl = window.URL.createObjectURL(blob);
      forceDownload(blobUrl, filename);
    })
    .catch((e) => console.error(e));
};
