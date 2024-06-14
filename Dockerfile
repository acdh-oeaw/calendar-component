FROM caddy:2-alpine

WORKDIR /usr/share/caddy

COPY ./example ./

EXPOSE 3000

CMD ["caddy", "file-server", "--listen", ":3000"]
