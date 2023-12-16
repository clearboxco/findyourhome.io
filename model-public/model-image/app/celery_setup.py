from flask import Flask,current_app
from celery import Celery, Task

def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.Task=FlaskTask
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app
  
  

    """
    celery.conf.update(
        broker_transport='sqs',
        broker_transport_options=broker_transport_options,
        celery_task_serializer='json',
        )
"""
    