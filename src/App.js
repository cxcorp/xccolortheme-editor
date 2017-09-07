import * as Promise from 'bluebird'
import * as plist from 'plist'
import React, { Component } from 'react'
import { FileSelector } from './components/FileSelector'
import { ControlPanel } from './components/ControlPanel'
import { ThemeEditor } from './components/ThemeEditor'
import { SyntaxDisplay } from './components/SyntaxDisplay'
import './App.css';
import sampleThemeUrl from './resources/One Dark.xccolortheme'

const BACKGROUND_COLOR_PLIST_KEY = 'DVTSourceTextBackground'
const COLORS_PLIST_KEY = 'DVTSourceTextSyntaxColors'
const FONTS_PLIST_KEY = 'DVTSourceTextSyntaxFonts'

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
        this.onLoadSampleTheme = this.onLoadSampleTheme.bind(this)
        this.loadThemeFile = this.loadThemeFile.bind(this)
    }

    onLoadSampleTheme() {
        fetch(sampleThemeUrl)
            .then(res => res.text())
            .then(this.loadThemeFile)
    }

    onFileChoose(file) {
        readFile(file).then(this.loadThemeFile)
    }

    onSyntaxItemUpdate(updatedItem) {
        this.setState((prevState, props) => {
            const key = updatedItem.name
            const newItems = {
                ...prevState.syntaxItems,
                [key]: updatedItem
            }
            return { syntaxItems: newItems }
        })
    }

    // TODO: make bg color changeable

    onSettingChange(settingName, newValue) {
        this.setState((prevState, props) => {
            const newSetting = {
                ...prevState.settings[settingName],
                value: newValue
            }
            const newSettings = {
                ...prevState.settings,
                [settingName]: newSetting
            }
            return { settings: newSettings }
        })
    }

    loadThemeFile(themeFile) {
        const plist = fileToPlist(themeFile)
        const syntaxItems = themePlistToSyntaxItems(plist)
        const backgroundColor = parsePlistColor(plist[BACKGROUND_COLOR_PLIST_KEY])
        this.setState({ syntaxItems, backgroundColor })
    }

    render() {
        const hideXcodePrefix = this.state.settings["ui.hideXcodePrefix"].value
        return (
            <div className="App">
                <div className="App-header">
                    <FileSelector onChoose={this.onFileChoose} />
                    or
                    <input type="button" value="Load sample" onClick={this.onLoadSampleTheme} />
                </div>
                <div className="App-intro">
                    <ControlPanel settings={this.state.settings} onSettingChange={this.onSettingChange} />
                    <div className="App-intro__controls">
                        <SyntaxDisplay syntaxItems={this.state.syntaxItems} backgroundColor={this.state.backgroundColor} />
                        <ThemeEditor syntaxItems={this.state.syntaxItems} hideXcodePrefix={hideXcodePrefix} onUpdate={this.onSyntaxItemUpdate} />
                    </div>
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