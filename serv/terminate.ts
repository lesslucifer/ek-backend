export default function terminate(server, options = { coredump: false, timeout: 500 }) {
  const exit = code => {
    options.coredump ? process.abort() : process.exit(code)
  }

  return (code, reason) => (err, promise) => {
    if (err && err instanceof Error) {
      console.error(err)
      if (err.message) {
        console.error(err.message)
      }
    }

    server.close(exit)
    setTimeout(exit, options.timeout).unref()
  }
}
