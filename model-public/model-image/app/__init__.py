import os

from flask import Flask

from flask_mail import Mail

from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()

def create_app(test_config=None):
    # create and configure the app
    appl = Flask(__name__, instance_relative_config=True)
    
    # ensure the instance folder exists
    try:
        os.makedirs(appl.instance_path)
    except OSError:
        pass

    if test_config is None:
        # load the instance config, if it exists, when not testing
        appl.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        appl.config.from_mapping(test_config)

    # celery setup
    from . import celery_setup as cs
    cs.celery_init_app(appl)
    
    # initializing plugins
    db.init_app(appl)
    login_manager.init_app(appl)

    with appl.app_context():                
        # registering blueprints
        from . import auth
        from . import fyh_model
        from . import data
        appl.register_blueprint(auth.bp, url_prefix='/api/v1' + auth.bp.url_prefix)
        appl.register_blueprint(fyh_model.bp, url_prefix='/api/v1' + fyh_model.bp.url_prefix)
        appl.register_blueprint(data.bp, url_prefix='/api/v1' + data.bp.url_prefix)
        
        db.create_all()

    
    return appl

if __name__ == "__main__":
    app=create_app()
    app.run(debug=True,port=5000)
    


