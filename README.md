JsonMasterModelViewer
=====================

JsonMasterModelViewer for Django Models


overview
------
It is a static file for displaying the django model JSON

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


How to make the dump data
------

  python manage.py dumpdata <appname appname ...>
