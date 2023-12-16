FROM nginx:latest

COPY build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"].