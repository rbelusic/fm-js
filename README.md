fm-js
=====

fm-js is [Model View ViewModel](http://en.wikipedia.org/wiki/Model_View_ViewModel) pattern implementation in Javascript. *Model* is implemented by [FM.DmObject](http://rawgithub.com/rbelusic/fm-js/doc/doc/FM.DmObject.html) class and its subclasses. The purpose of the model is to represent the data of interest to the application. The application is represented by the [FM.AppObject](https://rawgithub.com/rbelusic/fm-js/doc/doc/FM.AppObject.html) class. The *view* is implemented with standard HTML and CSS, which is the user interface. The *viewmodel* is implemented by [FM.MlHost](https://rawgithub.com/rbelusic/fm-js/doc/doc/FM.MlHost.html), [FM.MlObserver](https://rawgithub.com/rbelusic/fm-js/doc/doc/FM.MlObserver.html) and [FM.MlExtension](https://rawgithub.com/rbelusic/fm-js/doc/doc/FM.MlExtension.html) classes and its subclasses. The purpose of the viewmodel is to implement the application logic and two way data binding between the model and the view. In other words, any update in the model is reflected in the view, and any (user) action on the view updates the model.

The framework employs heavy use of the [observer pattern](http://en.wikipedia.org/wiki/Observer_pattern). E.g. the host (implemented by [FM.MlHost](https://rawgithub.com/rbelusic/fm-js/doc/doc/FM.MlHost.html)) is an observable HTML element ( *subject* in terms of the observer pattern) which receives DOM events and notifies the registered observers (implemented by [FM.MlObserver](https://rawgithub.com/rbelusic/fm-js/doc/doc/FM.MlObserver.html)). The easiest (and most common) way to register an observer to a host is to nest the observer HTML element inside the host HTML element. The application is the top layer and can register an observer, or be registered as observable, to/from any object/layer. Observer pattern among arbitrary objects/layers can be implemented easily. 

The framework also implements a dynamic templating mechanism. All objects extend from [FM.Object]() which enables them to:
 - Have attributes. Attributes are usually serializable and can be rendered in the view in a transparent manner.
 - Have properties. Properties are usually non serializable an represent the state of the object.
 - Be registered as observable or observer.


readme TODO: 

 - templating
 - observer pattern among arbitrary elements 
 - illustrative (not SSCCE) code examples


