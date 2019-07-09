# ONS Prototype Kit

A prototyping kit that uses the [ONS Design System](https://ons-design-system.netlify.com/) [(GitHub)](https://github.com/ONSdigital/design-system).

## Using this prototype kit

### Prerequisites

You'll need [Git](https://help.github.com/articles/set-up-git/), [Node.js](https://nodejs.org/en/), and [Yarn](https://yarnpkg.com/en/docs/getting-started) to run this project locally.

The version of node required is outlined in [.nvmrc](./.nvmrc).

### Forking

Before using this kit please fork it (from <https://github.com/ONSdigital/prototype-kit>) for your individual team. (Note: GitHub does not allow forking of your own repositories so this is the closest possible way of doing it)

```bash
git clone https://github.com/ONSdigital/prototype-kit <your-fork-name>
cd <your-fork-name>
git remote set-url origin https://github.com/ONSdigital/<your-fork-name>
git remote add upstream https://github.com/ONSdigital/prototype-kit
git push origin master
git push --all
```

### Applying updates from the original repository

```bash
git pull upstream master
```

### Using nvm (optional)

If you work across multiple Node.js projects there's a good chance they require different Node.js and npm versions.

To enable this we use [nvm (Node Version Manager)](https://github.com/creationix/nvm) to switch between versions easily.

1. [install nvm](https://github.com/creationix/nvm#installation)
2. Run nvm install in the project directory (this will use .nvmrc)

#### Windows users

The nvm listed above is only for Mac/Linux users. A separate version of nvm is available for Windows here: https://github.com/coreybutler/nvm-windows

### Install dependencies

```bash
yarn install
```

### Start a local server

```bash
yarn start
```

## Installing and using different Design System versions per prototype

It is possible to install different versions of the [@ons/design-system](https://www.npmjs.com/package/@ons/design-system) to use in each template.

To install a specific version without overwriting existing versions use this command (where both the x.x.x are the version number you want):

```bash
yarn add @ons/design-system/x.x.x@npm:@ons/design-system@x.x.x
```

In all of your templates for your prototype you must specify the version number in the [frontmatter](https://jekyllrb.com/docs/front-matter/) like so:

```
---
group: Example
version: x.x.x
---
```

### Removing a version of @ons/design-system

To remove a version of the @ons/design-system use:

```bash
yarn remove @ons/design-system/x.x.x
```

## Creating a prototype

To begin creating a new prototype first create a folder for your prototype under `src/prototypes`, and then create a file called `index.njk`.

You will then need to set the [frontmatter](https://jekyllrb.com/docs/front-matter/) in your newly created `index.njk` file:

For example:

```
---
version: 8.0.1
title: My Prototype
group: Components
---
```

| Property | Mandatory | Description                                                                                                                                                                                                                      |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version  | true      | Defines what version of the design system you would like to use. This needs to be set on every page                                                                                                                              |
| title    | true      | The name for your prototype. This will appear in the prototype kit's index page, and if you have not set `page.title` it will set the title in the header of your prototype. This is only mandatory on in your `index.njk` file. |
| group    | false     | Sets the group your prototype should appear in in the prototype kit's index page. You only need to set this in your `index.njk` file                                                                                             |

### Custom JavaScript

If you need to add custom JavaScript to your prototype, the build system will automatically look for a file called `index.js` in your prototype. Webpack will convert your JavaScript to ES5 code. You can refer to the example folder to see how to include the JavaScript in your template.

### Custom CSS

If you need to add custom CSS to style a new component or override styling on an existing component you can create a `.scss` file in the directory of your prototype. Webpack will spit out a `.css` file named the same as any `.scss` file that isn't prefixed with an underscore. You can refer to the example folder to see how to include generated css in your template.
