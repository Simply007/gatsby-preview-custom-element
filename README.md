# Kentico Cloud Gatsby Preview Custom Element

Gatsby preview custom element is watching content changes.
When the change is performed it sends the notification to the GatsbyJs and notify editor that the preview environment is ready to be previewed.

![Gatsby preview custom element](gatsby-preview-custom-element.gif)

## Usage

If you want to use the Gatsby preview custom element in your project in Kentico Cloud, follow these steps:

* In Kentico Cloud open Content types tab
* Open / create a content model to which you want to add the Gatsby preview custom element
* Add **Custom element** content element
* Open configuration of the content element
* Use following URL as Hosted code URL (HTTPS): https://Simply007.github.io/gatsby-preview-custom-element/dist/preview-element.html
* Provide the following JSON parameters for the custom element to connect it to the appropriate elements

```json
{
    "previewApiKey": "<YOUR PREVIEW API KEY>",
    "previewUrlPattern": "https://gatby-test-kc-preview/{lang}/{urlslug}",
    "urlSlugElement": "url_pattern",
    "gatsbyWebSocketUrl": "wss://echo.websocket.org"
}
```
## Installation

Gatsby preview custom element is in repository: https://github.com/Simply007/gatsby-preview-custom-element

If you want to adjust the implementation, first download [Kentico Cloud Custom Elements Devkit](https://github.com/kentico/custom-element-devkit). This repository should be positioned within `/client/custom-elements` folder. For further instructions on devkit implementation, please refer to [Custom Element Devkit README](https://github.com/Kentico/custom-element-devkit/blob/master/readme.md).

### Get started

You could use following commands to set up the development environment

Prerequisites:

* Node.js
* git

```plain
git clone https://github.com/Kentico/custom-element-devkit.git
cd custom-element-devkit
git clone https://github.com/Simply007/gatsby-preview-custom-element.git ./client/custom-elements/gatsby-preview-custom-element
npm start -- -hw
```

Browse: https://localhost:3000/custom-elements/gatsby-preview-custom-element

## Thanks


Thanks to [Martin Hejtmánek](https://github.com/kenticomartinh) and his [Preview availability custom element](https://github.com/kenticomartinh/custom-element-samples/tree/master/PreviewAvailability)
