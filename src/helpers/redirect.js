export default (ctx, path) => {
   if (ctx.res) {
    ctx.res.writeHead(302, { Location: path })
    ctx.res.end()
  } else {
    document.location = path
  }
}