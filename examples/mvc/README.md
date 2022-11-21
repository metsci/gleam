# MVC Example

Use an imperative approach to create an MV* ([Model View Whatever](https://news.ycombinator.com/item?id=18518750)) application:
 - Use `Ref` objects to hold application state in a data model
 - Create views to display application state
 - Call attach-controller fns to connect views to the model

Interaction:
 - SHIFT+Click on the spatial plot to add a data point at a specific location
 - SHIFT+Click on the timeline to add a data point at a specific time
 - Drag data points to change their locations and/or times
 - Move the time cursor to highlight data points near the selected time

![Screenshot](./screenshot.png)
