# ONS Prototype Kit

# ⚠️ Work in Progress ⚠️ 

A prototyping kit that uses the [ONS Design System](https://ons-design-system.netlify.com/) [(GitHub)](https://github.com/ONSdigital/pattern-library-v2).

## Using this prototype kit

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

## Removing a version of @ons/design-system

To remove a version of the @ons/design-system use:

```bash
yarn remove @ons/design-system/x.x.x
```
