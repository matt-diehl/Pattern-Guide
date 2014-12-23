/*jslint node: true */

'use strict';

// YAPL Requires
var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    yaml = require('js-yaml'),
    cheerio = require('cheerio'),
    _ = require('lodash'),
    utils = require('./lib/utils.js'),
    build = require('./lib/build.js');

// YAPL Internal Variables
var config = {
    settings: {
        cssBlockRegEx: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
        htmlBlockRegEx: /<!--\s*?YAPL\n([\s\S]*?)--\>/g,
        outputJsonFile: false,
        libraryIndex: './hbs/templates/index.hbs',
        libraryLayout: './hbs/layouts/default.hbs',
        libraryPartials: './hbs/partials/**/*.hbs',
        libraryCss: './css/yapl.css',
        libraryJs: './js/min/yapl.js'
    },
    sections: [],
    displayTemplates: [],
    imageSizes: []
};



// Initialize Function
function YAPL(options) {

    // Build Prep Steps
    extendConfig(options);
    createAllSectionObjects();
    //-> createSingleSectionObj
        //-> createAllSectionChildrenObjects
            //-> createSingleSectionChildObject
                //-> parseYAPLJsonFromFile
                    //-> createSingleCssYAPLBlockObject
    createAllDisplayTemplateObjects();
    //-> createSingleDisplayTemplateObject
        //-> parseYAPLJsonFromFile

    // Section-level Build
    setupHandlebarsConfig();
    buildAllHtmlExamples();
        //-> buildSingleHtmlExample
    generateAllBlockCssSelectors();

    createAllImageSizeObjects();
        //-> createSingleImageSizeOject
        //-> getAllImageUrlsFromHtml
        //-> sortAndMergeImageObjects

    // Cross Linking
    crossLinkBlocksAndTemplates();
        //-> searchAllBlocksAndTemplatesForSelector
            //-> htmlSelectorMatch

    // Output JSON to file if set as option
    outputConfigToFile();

    // Pattern Library Build
    build(config);

}


// Build Prep Steps

function extendConfig(options) {
    config = _.merge(config, options);
    config.settings.link = path.join(linkFromRoot(config.settings.buildDir), 'index.html');
}

function setupHandlebarsConfig() {
    var partials = glob.sync(config.settings.partials);
    // register built-in helpers
    if (helpers && helpers.register) {
        helpers.register(handlebars, {}, {});
    }
    // register all partials
    partials.forEach(function(partialPath) {
        var partialName = path.basename(partialPath, '.hbs'),
            partialContent = fs.readFileSync(partialPath, 'utf8');
        handlebars.registerPartial(partialName, partialContent);
    });
}

function createAllSectionObjects() {
    config.sections.forEach(function(section, index) {
        config.sections[index] = createSingleSectionObj(section);
    });
}

function createSingleSectionObj(obj) {
    var sectionObject = obj || {};

    sectionObject.name = obj.name || 'Undefined Section';
    sectionObject.nameCamelCase = utils.camelCase(sectionObject.name);
    sectionObject.nameCssCase = utils.cssCase(sectionObject.name);
    sectionObject.cssFiles = sectionObject.css ? glob.sync(sectionObject.css) : false;
    sectionObject.partials = obj.partials || config.settings.partials;
    sectionObject.partialFiles = sectionObject.partials ? glob.sync(sectionObject.partials) : false;
    sectionObject.data = obj.data || config.settings.data;
    sectionObject.dataFiles = sectionObject.data ? glob.sync(sectionObject.data) : false;
    sectionObject.path = sectionObject.landingTemplate ? path.join(config.settings.buildDir, sectionObject.nameCssCase, 'index.html') : false;
    sectionObject.link = sectionObject.path ? linkFromRoot(sectionObject.path) : false;
    sectionObject.children = sectionObject.cssFiles ? createAllSectionChildrenObjects(sectionObject.cssFiles, sectionObject.nameCssCase) : false;

    return sectionObject;
}

function createAllSectionChildrenObjects(cssFiles, sectionName) {
    var childrenObjects = [];

    cssFiles.forEach(function(cssFile) {
        var childObject = createSingleSectionChildObject(cssFile, sectionName);
        if (childObject) childrenObjects.push(childObject);
    });

    return childrenObjects;
}

function createSingleSectionChildObject(cssFile, sectionName) {
    var childObject = {},
        cssFileExt = path.extname(cssFile),
        cssFileBasename = path.basename(cssFile, cssFileExt).replace('_', ''),
        childObjectFilename = cssFileBasename + '.html';

    childObject.name = utils.titleCase(cssFileBasename);
    childObject.nameCamelCase = utils.camelCase(cssFileBasename);
    childObject.nameCssCase = cssFileBasename;
    childObject.path = path.join(config.settings.buildDir, sectionName, childObjectFilename);
    childObject.link = linkFromRoot(childObject.path);
    childObject.partial = cssFileBasename;
    childObject.blocks = parseYAPLJsonFromFile(cssFile, childObject);

    if (childObject.blocks && childObject.blocks.length) {
        return childObject;
    }
}

function createAllDisplayTemplateObjects() {
    var displayTemplateFiles = glob.sync(config.settings.displayTemplates),
        displayTemplatesArray = [];

    displayTemplateFiles.forEach(function(file) {
        var displayTemplateObject = createSingleDisplayTemplateObject(file);
        displayTemplatesArray.push(displayTemplateObject);
    });

    config.displayTemplates = displayTemplatesArray;
}

function createSingleDisplayTemplateObject(file) {
    var displayTemplateObject = parseYAPLJsonFromFile(file) || {},
        fileExt = path.extname(file),
        fileBasename = path.basename(file, fileExt);

    displayTemplateObject.name = displayTemplateObject.name || utils.titleCase(fileBasename);
    displayTemplateObject.group = 'default';
    displayTemplateObject.path = file;
    displayTemplateObject.link = linkFromRoot(file);

    return displayTemplateObject;
}

function createAllImageSizeObjects() {
    var imageSizeObjectsAll = [];

    // Loop through YAPL blocks to find images
    allYAPLBlocks().forEach(function(block) {
        if (block.html) {
            var imageUrls = getAllImageUrlsFromHtml(block.html);
            imageUrls.forEach(function(imageUrl) {
                var imageSizeObject = createSingleImageSizeObject(imageUrl, block.get('section'), block.get('sectionChild'));
                imageSizeObjectsAll.push(imageSizeObject);
            });
        }
    });

    // Loop through display templates to find images
    allDisplayTemplates().forEach(function(displayTemplate) {
        var html = fs.readFileSync(displayTemplate.path);
        if (html) {
            var imageUrls = getAllImageUrlsFromHtml(html);
            imageUrls.forEach(function(imageUrl) {
                var imageSizeObject = createSingleImageSizeObject(imageUrl, null, null, displayTemplate);
                imageSizeObjectsAll.push(imageSizeObject);
            });
        }
    });

    config.imageSizes = sortAndMergeImageObjects(imageSizeObjectsAll);
}

// TODO: Fix weirdness of using for both sections and display templates
function createSingleImageSizeObject(imageUrl, section, sectionChild, displayTemplate) {
    var imageObject = {};

    imageObject.dimensions = utils.dimensions(imageUrl);
    imageObject.ratio = utils.aspectRatio(imageObject.dimensions);
    imageObject.html = utils.placeholderImage(imageObject.dimensions);
    imageObject.references = {};

    if (section) {
        imageObject.references.sections = [{
            name: section ? section.name : '',
            children: section ? [sectionChild] : []
        }];
    } else if (displayTemplate) {
        imageObject.references.displayTemplates = [displayTemplate];
    }

    return imageObject;
}

function getAllImageUrlsFromHtml(html) {
    var $ = cheerio.load(html),
        images = $('img'),
        imageUrlArray = [];

    images.each(function(i, elem) {
        var imageUrl = path.join(config.settings.siteRoot, $(this).attr('src')),
            imageExt = path.extname(imageUrl).toLowerCase();
        // Don't collect SVGs as they're only used for icons/global elements
        // The image size package also sometimes throws an error on them
        // TODO: May want to make this a setting to test for an ignore pattern
        if (imageExt !== '.svg') {
            imageUrlArray.push(imageUrl);
        }
    });

    return imageUrlArray;
}

function sortAndMergeImageObjects(objects) {
    var imageSizeObjectsCondensed = [],
        imageSizeObjectGroups;

    imageSizeObjectGroups = _.chain(objects)
        .groupBy(function(object) {
            return object.dimensions;
        })
        .sortBy('dimensions')
        .value();

    imageSizeObjectGroups.forEach(function(group) {
        var mergedImageObject = {};

        group.forEach(function(imageObject) {
            _.merge(mergedImageObject, imageObject);
        });
        imageSizeObjectsCondensed.push(mergedImageObject);
    });

    return imageSizeObjectsCondensed;
}



function parseYAPLJsonFromFile(file, blockParent) {
    var fileExt = path.extname(file),
        fileContent = fs.readFileSync(file, 'utf8'),
        regEx = _.contains(fileExt, 'html') ? config.settings.htmlBlockRegEx :
                _.contains(fileExt, 'css') ? config.settings.cssBlockRegEx : false,
        YAPLBlocks = fileContent.match(regEx),
        YAPLJson = [];

    if (YAPLBlocks && YAPLBlocks.length) {
        YAPLBlocks.forEach(function(YAPLBlock) {
            var yamlString,
                json;

            yamlString = YAPLBlock.replace(regEx, function(match, p1) {
                return p1;
            });

            json = yaml.safeLoad(yamlString);

            if (_.contains(fileExt, 'css')) {
                json = createSingleCssYAPLBlockObject(json, blockParent);
                YAPLJson.push(json);
            } else if (_.contains(fileExt, 'html')) {
                // HTML files only contain one YAPL block
                YAPLJson = json;
            }

        });
        return YAPLJson;
    }
}

function createSingleCssYAPLBlockObject(obj, blockParent) {
    var blockObj = obj || {};

    blockObj.name = obj.name || 'Undefined Name';
    blockObj.nameCamelCase = utils.camelCase(blockObj.name);
    blockObj.nameCssCase = utils.cssCase(blockObj.name);
    blockObj.partial = obj.partial || blockParent.partial;
    blockObj.link = blockParent.link + '#' + blockObj.nameCssCase;

    return blockObj;
}



// Section-Level Build

function buildAllHtmlExamples() {
    allYAPLBlocks().forEach(function(block) {
        block.html = buildSingleHtmlExample(block, block.get('section'));
    });
}

function buildSingleHtmlExample(block, section) {
    var partialFile,
        partialFileContent,
        dataFile,
        dataFileContent,
        blockContextRoot = block.context && block.context.split('.')[0],
        blockContextTip = block.context && block.context.split('.')[1],
        blockContextJson = '',
        template,
        html;

    partialFile = _.find(section.partialFiles, function(file) {
        var fileExt = path.extname(file),
            fileBasename = path.basename(file, fileExt);
        return block.partial === fileBasename;
    });

    if (partialFile) {
        partialFileContent = fs.readFileSync(partialFile, 'utf8');
    }

    if (block.context) {
        dataFile = _.find(section.dataFiles, function(file) {
            var fileExt = path.extname(file),
                fileBasename = path.basename(file, fileExt);
            return blockContextRoot === fileBasename;
        });
    }

    if (dataFile) {
        dataFileContent = fs.readFileSync(dataFile, 'utf8');
        if (path.extname(dataFile) === '.yaml') {
            blockContextJson = yaml.safeLoad(dataFileContent)[blockContextTip];
        } else if (path.extname(dataFile) === '.json') {
            blockContextJson = JSON.parse(dataFileContent)[blockContextTip];
        }
    }

    if (partialFileContent) {
        template = handlebars.compile(partialFileContent);
        html = template(blockContextJson);
        html = html.replace(/^\s+|\s+$/g, '');
        html = html.replace(/\n+/g, '\n');
        return html;
    }

}

function generateAllBlockCssSelectors() {
    allYAPLBlocks().forEach(function(block) {
        var $dom, domItems, classAttr, selector;

        if (block.html && !block.selector) {
            $dom = cheerio.load(block.html);
            domItems = $dom('*');
            classAttr = domItems.eq(0).attr('class');
            if (classAttr) {
                selector = classAttr.trim();
                selector = '.' + selector.replace(/ /g, '.');
                block.selector = selector;
            } else {
                block.selector = false;
            }
        }
    });
}



// Cross Linking

function crossLinkBlocksAndTemplates() {
    allYAPLBlocks().forEach(function(block) {
        if (block.selector) {
            block.references = searchAllBlocksAndTemplatesForSelector(block.selector);
        }
    });
}

function searchAllBlocksAndTemplatesForSelector(selector) {
    var references = {
            sections: [],
            displayTemplates: []
        },
        sectionsCondensed = [],
        sectionGroups;

    allYAPLBlocks().forEach(function(block) {
        // If the block selector matches the one we're looking for, don't search it
        // Otherwise, search the html for the selector
        if (block.selector && selector && selector.indexOf(block.selector) < 0 && block.html && htmlSelectorMatch(block.html, selector)) {
            var reference = {
                name: block.get('section').name,
                children: [block.get('sectionChild')]
            };
            references.sections.push(reference);
        }
    });

    allDisplayTemplates().forEach(function(template) {
        var html = fs.readFileSync(template.path);
        if (html && htmlSelectorMatch(html, selector)) {
            references.displayTemplates.push(template);
        }
    });

    sectionGroups = _.chain(references.sections)
        .groupBy(function(section) {
            return section.name;
        })
        .value();

    _.forIn(sectionGroups, function(group, key) {
        var mergedReference = {};

        group.forEach(function(reference) {
            _.merge(mergedReference, reference);
        });
        sectionsCondensed.push(mergedReference);
    });

    references.sections = sectionsCondensed;

    return references;
}

function htmlSelectorMatch(html, selector) {
    var $dom = cheerio.load(html),
        selectorMatch = $dom(selector).length;
    return selectorMatch;
}



// File Output

function outputConfigToFile() {
    var outputPath = config.settings.outputJsonFile,
        outputDir = path.dirname(outputPath),
        outputFilename = path.basename(outputPath);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    fs.writeFileSync(config.settings.outputJsonFile, JSON.stringify(config));
}


// Internal Utilities

function allYAPLBlocks() {
    var blocks = [];

    config.sections.forEach(function(section) {
        if (section.children && section.children.length) {
            section.children.forEach(function(sectionChild) {
                if (sectionChild.blocks && sectionChild.blocks.length) {
                    sectionChild.blocks.forEach(function(block) {

                        block.get = function(val) {
                            return val === 'section' ? section :
                                   val === 'sectionChild' ? sectionChild : false;
                        };
                        blocks.push(block);

                    });
                }
            });
        }
    });

    return blocks;
}

function allDisplayTemplates() {
    return config.displayTemplates;
}

function linkFromRoot(link) {
    var relativePath = path.relative(config.settings.siteRoot, link);
    return '/' + relativePath;
}


module.exports = YAPL;
