FROM python:3.10.5-slim-buster
WORKDIR /application

COPY app app
COPY instance instance

# Flask-Login issues with Werkzeug; limit to 2.3.*
COPY requirements.txt requirements.txt

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 5000

RUN apt-get update && apt-get install -y libpq-dev
RUN apt-get update && apt-get install -y supervisor
RUN apt-get update && apt-get install -y gcc
RUN pip install --no-cache-dir -r requirements.txt

CMD [ "/usr/bin/supervisord" ]