import * as Promise from 'bluebird'
import * as plist from 'plist'
import React, { Component } from 'react'
import { FileSelector } from './components/FileSelector'
import { ControlPanel } from './components/ControlPanel'
import { ThemeEditor } from './components/ThemeEditor'
import './App.css';

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            syntaxItems: null,
            settings: {
                "ui.hideXcodePrefix": { value: false, desc: 'Hide xcode prefix from names' }
            }
        }
        this.onFileChoose = this.onFileChoose.bind(this)
        this.onSyntaxItemUpdate = this.onSyntaxItemUpdate.bind(this)
        this.onSettingChange = this.onSettingChange.bind(this)
    }

    onFileChoose(file) {
        readFile(file).then(themeFile => {
            const plist = fileToPlist(themeFile)
            const syntaxItems = themePlistToSyntaxItems(plist)
            this.setState({ syntaxItems })
        })
    }

    onSyntaxItemUpdate(updatedItem) {
        const key = updatedItem.name
        const newItems = {
            ...this.state.syntaxItems,
            [key]: updatedItem
        }
        this.setState({ syntaxItems: newItems })
    }

    onSettingChange(settingName, newValue) {
        const newSetting = {
            ...this.state.settings[settingName],
            value: newValue
        }
        const newSettings = {
            ...this.state.settings,
            [settingName]: newSetting
        }
        this.setState({ settings: newSettings })
    }

    render() {
        const hideXcodePrefix = this.state.settings["ui.hideXcodePrefix"].value
        return (
            <div className="App">
                <div className="App-header">
                    <FileSelector onChoose={this.onFileChoose} />
                </div>
                <div className="App-intro">
                    <ControlPanel settings={this.state.settings} onSettingChange={this.onSettingChange} />
                    <ThemeEditor syntaxItems={this.state.syntaxItems} hideXcodePrefix={hideXcodePrefix} onUpdate={this.onSyntaxItemUpdate} />
                </div>
            </div>
        );
    }
}

// File => Promise<string>
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsText(file)
    })
}

function fileToPlist(file) {
    return plist.parse(file)
}

const COLORS_PLIST_KEY = 'DVTSourceTextSyntaxColors'
const FONTS_PLIST_KEY = 'DVTSourceTextSyntaxFonts'

function themePlistToSyntaxItems(plist) {
    const colors = plist[COLORS_PLIST_KEY]
    const fonts = plist[FONTS_PLIST_KEY]
    // TODO: breaks if colors or fonts missing from plist
    const itemNames = [...Object.keys(colors), ...Object.keys(fonts)]

    const items = {}
    for (const itemName of itemNames) {
        const color = parsePlistColor(colors[itemName])
        const font = parsePlistFont(fonts[itemName])
        if (color === undefined && font === undefined)
            continue

        items[itemName] = { color, font }
    }

    return items
}

function parsePlistColor(plistColor) {
    if (!plistColor) return undefined
    // format: "r g b a" where each is a decimal 0-1
    const components = plistColor.split(' ').map(parseFloat)
    const [r, g, b, a] = components
    return { r, g, b, a }
}

// match e.g. "Input-Regular - 14.0" => ["Input-Regular", "14.0"]
const FONT_REGEX = /^(.+) - (\d+(?:\.\d+)*)$/

function parsePlistFont(plistFont) {
    if (!plistFont) return undefined

    const matches = FONT_REGEX.exec(plistFont)
    const name = matches[1]
    const sizeStr = matches[2]

    const size = parseFloat(sizeStr)
    if (isNaN(size)) return undefined
    return { name, size }
}

export default App
