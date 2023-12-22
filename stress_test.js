// loop 50 times and send 50 requests to the server

(async () => {
  for (let i = 0; i < 50; i++) {
    const res = await fetch("http://localhost:3323/read", {
      method: "POST",
      body: JSON.stringify({
        link: "sofua.co.uk",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(await res.json());
  }
})();
