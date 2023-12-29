FROM python:3.10.5-slim-buster
WORKDIR /pipeline

COPY requirements.txt requirements.txt
COPY config.py config.py
COPY data_script.py data_script.py

RUN apt-get update && apt-get install -y libpq-dev
RUN apt-get update && apt-get install -y gcc
RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["python","data_script.py"]

CMD []