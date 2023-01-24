# nodebb-plugin-customize

![Compatibility](https://packages.nodebb.org/api/v1/plugins/nodebb-plugin-customize/compatibility.png)
[![Downloads](https://img.shields.io/npm/dm/nodebb-plugin-customize.svg)](https://www.npmjs.com/package/nodebb-plugin-customize)
[![Dependency Status](https://david-dm.org/NodeBB-Community/nodebb-plugin-customize.svg)](https://david-dm.org/NodeBB/nodebb-plugin-customize)

Customize the language translations and templates used in NodeBB's interface.

## Usage

Go to ACP > Plugins > Customize.

To customize a translation, select the Namespace and Key you want to replace. 
Then, enter your Replacement text and click the check mark to add it.

To customize a template, select the template you want to modify. 
Then, click the pencil to open up the editing panel.
The text on the left is the original for reference, and you can modify the one on the right.
Edit the template as you see fit, then click Done to close the panel, and the check mark to add it.

After adding your customizations, click the "wrench" button in the bottom right to apply them.
Then Rebuild and Restart NodeBB, and your changes should show up.

## Installation

For best results, install `nodebb-plugin-customize` through the NodeBB Admin Panel.

### Manual installation

If `nodebb-plugin-customize` is not available through the ACP, you can install it manually with NPM

    npm install nodebb-plugin-customize
