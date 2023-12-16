from . import create_app

flask_app = create_app()
celery_app = flask_app.extensions["celery"]


# Use Python paths; e.g., "app.make_celery"