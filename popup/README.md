# The JavaScript plugin - popup

## Using
1. Add the data tag to the link what you want to open the popup:
data-superbox="true"

2. Add the href link with format: [# + The popup container ID | url]?[Options...]
Ex: 
- Inline:
#popup-container?width=600&height=600&type=inline&scroll=outer&isCloseViaOverlay=false&position=[100,100]

- Ajax:
info.html?width=600&height=600&type=ajax&scroll=outer&isCloseViaOverlay=false&position=[100,100]

- Iframe:
- Ajax:
info.html?width=600&height=600&type=iframe&scroll=outer&isCloseViaOverlay=false&position=[100,100]

## Functionalities
- init()
- open()
- close()
- reposition()
- destroy()
- beforeOpen()
- afterOpen()
- beforeClose()
- afterClose()