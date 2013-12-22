JsonMasterModelViewer
=====================

JsonMasterModelViewer for Django Models


overview
------
It is a static file for displaying the django model JSON.


format
------

    [
        {
            "pk": 1, 
            "model": "appname.tablename", 
            "fields": {
                "key1": "value1", 
                "key2": "value2", 
            }
        },
      ...
    ]


make
------
by django command

    python manage.py dumpdata <appname appname ...>
