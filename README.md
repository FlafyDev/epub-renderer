# Epub Renderer

An EPUB Renderer for my [Book Reader](https://github.com/FlafyDev/epub_reader).

## Usage

###### Outdated. I change stuff to quickly so it's not worth to document it for now.

### Controlling

You must have access to the `window` object to controller the renderer.

`window.data(baseUrl: string)` - From which server to request files(such as html, css, images, ...).

`window.page(pageFilePath: string, innerPage?: number)` - Shows the html of the file. Shows only part of the html according to the innerPage.

`window.pageGoAnchor(pageFilePath: string, innerAnchor: string)` - Similar to `window.page` but takes an anchor instead of an innerPage.

`window.style(style: StyleProperties)` - Set the style of what will be rendered. Look into the code to see what StyleProperties allow you to do.

`window.css(css: string)` - Custom css to add to what will be rendered.

`window.clearSelection()` - Clear the selected text.

### Handlers

Handlers are ways for the renderer to communicate with whatever controls it.

This is how Handlers are sent:

```js
window.flutter_inappwebview.callHandler(name, ...args);
```

where `args` is `any[]`

#### List of Handlers:

- `load` - everything has been loaded and can now be controlled.
- `ready` - when a page is loaded either with `window.page` or `window.pageGoAnchor`.  
  `args = [innerPage: int, innerPages: int, passedAnchors: string[]]`

- `link` - when pressing on any link.
  `args = [link: String]`

- `selection` - when text is being highlighted.
  `args = [text: String, left: int, top: int, width: int, height: int]`

### Providing files with a server

To provide files to the renderer you need to use a server.

Endpoints:

- `/epub/` To access the EPUB's files

[An example for a server written in Dart](https://github.com/FlafyDev/epub_renderer_server)

## TODO

- move from `window` to `globalThis` (or possibly postMessage?)
- protect against code execution
