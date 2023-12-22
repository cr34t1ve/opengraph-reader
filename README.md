## Open Graph Scraper Worker with RabbitMQ and ExpressJS

This is a simple example of how to use RabbitMQ to scrape Open Graph data from a URLs.

### How to run

- Run rabbitmq server

```
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management
```

- Install dependencies

```
yarn install
```

- Run the app

```
yarn dev
```

- POST request to http://localhost:3323/read

```
{
  "link": "https://www.youtube.com/watch?v=dGhEzL3e72o"
}
```
