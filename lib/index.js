const { createReadStream, promises: fs } = require('fs');
const path = require('path');
const util = require('util');

const globCb = require('glob');
const { imageSize: imageSizeCb } = require('image-size');
const inquirer = require('inquirer');
const yaml = require('js-yaml');
const markdown2confluence = require('markdown2confluence-cws');
const rp = require('request-promise');
const { createLogger, format, transports } = require('winston');

const glob = util.promisify(globCb);
const imageSize = util.promisify(imageSizeCb);

// A preffer to use this instead console.log
const logger = createLogger({
  transports: [new transports.Console()],
  exitOnError: true,
  format: format.cli(),
});

async function main() {
  const prompts = [];
  const user = process.env.MD2CUSER;
  const pass = process.env.MD2CPASS;

  /*
   * Let's read the config file
   */
  const config = JSON.parse(
    await fs.readFile(path.join('.md2confluencerc.json'), 'utf8'),
  );

  if (user) {
    config.user = user;
  }

  if (pass) {
    config.pass = pass;
  }

  if (!config.user) {
    prompts.push({
      type: 'input',
      name: 'user',
      message: 'Your Confluence username:',
    });
  }
  if (!config.pass) {
    prompts.push({
      type: 'password',
      name: 'pass',
      message: 'Your Confluence password:',
    });
  }

  const answers = await inquirer.prompt(prompts);
  answers.user = config.user || answers.user;
  answers.pass = config.pass || answers.pass;

  const prefix = config.prefix ? `{info}${config.prefix}{info}\n\n` : '';

  // For any file in the .md2confluencerc.json file...
  const pages = [];

  if (config.include) {
    for (const include of config.include) {
      const opts = {
        nodir: true,
        ignore: config.exclude || [],
      };
      const mdfiles = await glob(include, opts);
      for (const mdfile of mdfiles) {
        logger.debug(`Parsing "${mdfile}"`);

        // 1. Get the markdown file content
        const fileData = await fs.readFile(mdfile, { encoding: 'utf8' });

        // 2. Extract metadata
        const match = /^---$(?<metadata>.*?)^---$(?<markdown>.*)/ms.exec(
          fileData,
        );
        if (!match) {
          logger.warn(
            `${mdfile} does not start with the expected YAML front matter`,
          );
          continue;
        }
        const metadata = yaml.safeLoad(match.groups.metadata);
        const pageid = String(metadata.pageid);
        const title = String(metadata.title);

        // 3. Store the page to be processed
        pages.push({ pageid, mdfile, title, fileData: match.groups.markdown });
      }
    }
  }

  if (config.pages) {
    for (const pageData of config.pages) {
      // 1. Get the markdown file content
      const fileData = await fs.readFile(pageData.mdfile, { encoding: 'utf8' });

      // 2. Store the page to be processed
      pages.push({ ...pageData, fileData });
    }
  }

  const rpConfluence = rp.defaults({
    baseUrl: config.baseUrl,
    auth: { user: answers.user, pass: answers.pass, sendImmediately: true },
    json: true,
  });

  for (const pageData of pages) {
    logger.debug(`Starting to render "${pageData.mdfile}"`);

    // 1. Transform the content to Markdown Wiki
    const imagePaths = [];
    const mdWikiData =
      prefix.replace('{path}', pageData.mdfile) +
      markdown2confluence(pageData.fileData, {
        codeLanguageMap: { json: 'json' },
        imageRewrite: (href) => {
          imagePaths.push(href);
          return path.basename(href);
        },
      });
    // console.log('mdWikiData', JSON.stringify(mdWikiData));

    // 2. Transform the Markdown Wiki to Storage (confluence scripting)
    const newContent = await rpConfluence({
      method: 'POST',
      uri: 'contentbody/convert/storage',
      // headers: { 'Content-Type': 'application/json' },
      body: { value: mdWikiData, representation: 'wiki' },
    });
    // console.log('newContent', JSON.stringify(newContent));

    // 3. Get current data of the confluence page
    const currentPage = await rpConfluence({
      method: 'GET',
      uri: `content/${pageData.pageid}`,
      body: {},
    });
    // console.log('currentPage', JSON.stringify(currentPage));

    // 3½. Update image attachments
    for (const imagePath of imagePaths) {
      logger.info(`Uploading image attachment "${imagePath}"`);
      const imageFullPath = path.join(
        process.cwd(),
        path.dirname(pageData.mdfile),
        imagePath,
      );
      const imageName = path.basename(imagePath);

      await rpConfluence({
        method: 'PUT',
        headers: { 'X-Atlassian-Token': 'nocheck' },
        uri: `content/${pageData.pageid}/child/attachment`,
        formData: {
          file: {
            value: createReadStream(imageFullPath),
            options: { filename: imageName },
          },
        },
      });

      logger.info(`Determining image dimensions "${imagePath}"`);
      const size = await imageSize(imageFullPath);
      newContent.value = newContent.value.replace(
        `<ac:image><ri:attachment ri:filename="${imageName}" />`,
        `<ac:image ac:original-height="${size.height}" ac:original-width="${size.width}"><ri:attachment ri:filename="${imageName}" />`,
      );
    }

    // 4. Update the page in confluence
    const update = {
      type: currentPage.type,
      title: pageData.title,
      version: { number: parseInt(currentPage.version.number, 10) + 1 },
      status: 'current',
      body: {
        storage: { value: newContent.value, representation: 'storage' },
      },
    };
    const updatedPage = await rpConfluence({
      method: 'PUT',
      uri: `content/${pageData.pageid}`,
      body: update,
    });
    // console.log('updatedPage', JSON.stringify(updatedPage));

    // everything is saved
    const { _links: links } = updatedPage;
    logger.info(`"${updatedPage.title}" saved to ${links.base}${links.webui}`);
  }
}

main().catch((e) => logger.error(e.stack));
