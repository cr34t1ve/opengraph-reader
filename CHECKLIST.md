# Checklist

- [x] Have an endpoint (/read)
- [x] Call the endpoint with an article link in the body
- [x] When you receive a valid body, send it off to a queue
- [x] Read links from the queue with a handler that uses this library `fetch-opengraph` to
  - Fetch the title of the article
  - Fetch any image links available
  - Write it to file with a completion date
  - Write it to a postgres database with a completion date
