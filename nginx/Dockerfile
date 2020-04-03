FROM nginx:1.17.7 as base

# Expose the HTTP and HTTPS port to the Docker instance (not the host!).
EXPOSE 80 443

# Include '-g daemon off;' in the CMD in order for nginx to stay in the foreground.
CMD [ "/opt/wait-for-it.sh", "-t", "0", "backend:4000", "--", "/opt/wait-for-it.sh", "-t", "0", "frontend:3000", "--", "nginx", "-g", "daemon off;" ]

# Configure nginx with the development configuration.
FROM base as development
COPY nginx.dev.conf /etc/nginx/nginx.conf

# Configure nginx with the production configuration.
FROM base as production
COPY nginx.conf /etc/nginx/nginx.conf
