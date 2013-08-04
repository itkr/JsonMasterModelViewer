JsonMasterModelViewer
=====================

JsonMasterModelViewer for Django Models


overview
------
It is a static file for displaying the django model JSON.

Format that can be used.

    [
      {
        "pk": 1, 
        "model": "service.service", 
        "fields": {
        "key1": "value1", 
        "key2": "value2", 
      },
      ...
    ]


make json
------
by django command

    python manage.py dumpdata <appname appname ...>
