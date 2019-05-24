import * as fs from 'fs';
import loaderUtils from 'loader-utils';
import nunjucks from 'nunjucks';
import frontmatter from 'frontmatter';
import pretty from 'pretty';
import chalk from 'chalk';
import { htmlErrorStack } from 'print-error';

import { NunjucksLoader } from './nunjucks-loader';
import { removeFrontmatterFromString } from './remove-frontmatter-from-string';

import { navigationHelper } from './helpers';
import setAttribute from './filters/set-attribute';
import setAttributes from './filters/set-attributes';

function getAllTemplates(context) {
  if (context._module.issuer._identifier) {
    return context._module.issuer._identifier
      .slice(7)
      .split(' .')
      .filter(path => !path.includes('node_modules'))
      .sort((a, b) => a.split('/').length - b.split('/').length);
  } else {
    return [];
  }
}

function buildSiteMap(context) {
  const templates = getAllTemplates(context);
  const siteMap = [];

  templates.forEach(path => {
    const pathParts = path.split('/').slice(1);
    const frontmatter = getFrontmatterFromFile(context.rootContext + path);
    const sortOrder = frontmatter.sortOrder || Infinity;
    const group = frontmatter.group || '';
    let ref = siteMap;

    pathParts.forEach((part, index) => {
      if (part.includes('.njk')) {
        // If is page
        const key = part.replace('.njk', '');
        let title = frontmatter.title;

        // Set title
        if (!title) {
          if (key.toLowerCase() === 'index') {
            title = pathParts[index - 1];
          } else {
            title = key;
          }
        }

        // Add page to siteMap
        ref.push({
          title,
          sortOrder,
          group,
          url: path.replace('/index.njk', '').replace('.njk', '') || '/'
        });

      } else {
        const newRef = ref.find(page => page.url === `/${pathParts.slice(0, index).join('/')}`);

        if (newRef) {
          if (!newRef.children) {
            newRef.children = [];
          }

          ref = newRef.children;
        }
      }
    });
  });

  return siteMap;
}

function getPageInfo(context) {
  const siteMap = buildSiteMap(context);
  const path = (context.resourcePath.replace(context.rootContext, '').replace('/index.njk', '').replace('.njk', '') || '/');
  const pathParts = path.split('/');
  const pathDepth = pathParts.length;
  const rootPath = `/${pathParts.slice(1, 3).join('/')}`;
  let parentPath = `/${pathParts.slice(1, pathDepth - 1).join('/')}`;

  if (parentPath.split('/').length === 2) {
    parentPath = '/';
  }

  let parent;
  let pageRef = siteMap;

  pathParts.forEach((part, index) => {
    if (pageRef) {
      const pathToFind = `${pathParts.slice(0, index + 1).join('/')}` || '/';
      const children = (Array.isArray(pageRef) ? pageRef : pageRef.children);

      if (children) {
        const newRef = children.find(page => page.url === pathToFind);

        if (newRef) {
          pageRef = newRef;

          if (index === pathDepth - 2) {
            parent = newRef;
          }
        }
      }
    }
  });

  if (pageRef) {
    const title = pageRef.title;
    const children = pageRef.children;

    return { path, parentPath, rootPath, children, parent, title, siteMap };
  } else {
    return { path, parentPath, rootPath };
  }
}

function handleError(error, environment, layoutPath, callback, pageInfo) {
  if (error) {
    const filePath = `${process.cwd()}/src${pageInfo.path}/index.njk`;
    console.log('');
    console.log(chalk.red(error.stack.replace('(unknown path)', filePath)));
    let html = htmlErrorStack(error, { fontSize: '10px' }).replace('(unknown path)', filePath);
    html = `{% extends "views/layouts/error/_error.njk" %}{% block body %}${html}{% endblock %}`;
    html = nunjucks.compile(html, environment).render({
      error: error.toString()
    });

    callback(null, html);
  }
}


function getFrontmatterFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const file = fs.readFileSync(filePath, 'utf8');
  return frontmatter(file).data || {};
}

export default async function(source) {
  this.cacheable();
  const callback = this.async();
  const options = loaderUtils.getOptions(this) || {};
  const pageInfo = getPageInfo(this);
  const frontmatterData = frontmatter(source).data;

  // Remove frontmatter from source
  source = removeFrontmatterFromString(source);

  // Combine context to be passed to template
  const context = Object.assign(
    {
      pageInfo,
      page: frontmatterData,
      data: frontmatterData
    },
    options.context
  );
  
  let searchPaths = Array.isArray(options.searchPaths) ? options.searchPaths : [option.searchPaths];
  
  searchPaths = searchPaths.map(path => {
    if (path.includes('@ons/design-system')) {
      return `${path}/${frontmatterData.version}`;
    } else {
      return path;
    }
  });

  // Create nunjucks loader
  const loader = new NunjucksLoader(searchPaths, this.addDependency.bind(this));

  // Create nunjucks environment
  const environment = new nunjucks.Environment(loader);
  nunjucks.configure(null, {
    watch: false,
    autoescape: true
  });

  environment.addGlobal('helpers', {
    navigationHelper,
    addDependency: this.addDependency.bind(this)
  });

  environment.addFilter('setAttribute', setAttribute);
  environment.addFilter('setAttributes', setAttributes);

  // Get page layout template path
  let layoutPath;

  if (frontmatterData && frontmatterData.layout) {
    layoutPath = `${frontmatterData.layout}.njk`;

    if (layoutPath.slice(0, 1) !== '_' && !layoutPath.includes('/')) {
      layoutPath = `_${layoutPath}`;
    }

    layoutPath = `${options.layoutPath}/${layoutPath}`;
  } else {
    layoutPath = options.defaultLayout;
  }

  const layoutFullPath = findLayout(searchPaths, layoutPath);

  this.addDependency(layoutFullPath);

  // Wrap html in extend for layout
  source = `{% extends "${layoutPath}" %}\n${source}`;

  // Render page nunjucks to HTML
  nunjucks.compile(source, environment).render(context, (error, result) => {
    if (error) {
      handleError(error, environment, options.layoutPath, callback, pageInfo);
    } else {
      // Prettify HTML to stop markdown wrapping everything in code blocks
      const html = pretty(result, {
        ocd: true
      });

      callback(null, html);
    }
  });
}

function findLayout(searchPaths, layoutPath) {
  if (!Array.isArray(searchPaths)) {
    searchPaths = [searchPaths];
  }

  const path = searchPaths.find(searchPath => fs.existsSync(`${searchPath}/${layoutPath}`));

  if (path) {
    return `${path}/${layoutPath}`;
  }
}
