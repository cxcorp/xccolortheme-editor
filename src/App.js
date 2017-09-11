import * as Promise from 'bluebird'
import * as plist from 'plist'
import React, { Component } from 'react'
import * as Bacon from 'baconjs'
import * as FileSaver from 'file-saver'
import { FileSelector } from './components/FileSelector'
import { ControlPanel } from './components/ControlPanel'
import { ThemeEditor } from './components/ThemeEditor'
import { SyntaxDisplay } from './components/SyntaxDisplay'
import './App.css';
import sampleThemeUrl from './resources/One Dark.xccolortheme'

const BACKGROUND_COLOR_PLIST_KEY = 'DVTSourceTextBackground'
const COLORS_PLIST_KEY = 'DVTSourceTextSyntaxColors'
const FONTS_PLIST_KEY = 'DVTSourceTextSyntaxFonts'

const DEFAULT_PLIST_FONT = 'monospace - 12'
const DEFAULT_PLIST_COLOR = '0.894 0.521 0.796 1' // pretty pink
const MAX_PLIST_DECIMAL_PRECISION = 7

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            plist: null,
            syntaxItems: null,
            fileName: null,
            settings: {
                "ui.hideXcodePrefix": { value: true, desc: 'Hide xcode prefix from names' }
            }
        }

        this.itemFocusRequestedBus = new Bacon.Bus() // plz forgif

        this.onFileChoose = this.onFileChoose.bind(this)
        this.onSyntaxItemUpdate = this.onSyntaxItemUpdate.bind(this)
        this.onSettingChange = this.onSettingChange.bind(this)
        this.onLoadSampleTheme = this.onLoadSampleTheme.bind(this)
        this.loadThemeFile = this.loadThemeFile.bind(this)
        this.onExportClicked = this.onExportClicked.bind(this)
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

    onExportClicked() {
        if (!this.state.plist || !this.state.syntaxItems) return
        const { colors, fonts } = syntaxItemsToPlistFontsAndColors(this.state.syntaxItems)
        const newPlist = {
            ...this.state.plist,
            [COLORS_PLIST_KEY]: colors,
            [FONTS_PLIST_KEY]: fonts
        }
        const exportData = plist.build(newPlist)
        saveString(exportData, 'filename.xccolortheme', 'application/xml;charset=utf-8')
    }

    loadThemeFile(themeFile) {
        const plist = fileToPlist(themeFile)
        const syntaxItems = themePlistToSyntaxItems(plist)
        const backgroundColor = parsePlistColor(plist[BACKGROUND_COLOR_PLIST_KEY])
        this.setState({ plist, syntaxItems, backgroundColor })
    }

    render() {
        const hideXcodePrefix = this.state.settings["ui.hideXcodePrefix"].value

        const themeEditor =
            <ThemeEditor
                syntaxItems={this.state.syntaxItems}
                hideXcodePrefix={hideXcodePrefix}
                onUpdate={this.onSyntaxItemUpdate}
                itemFocusRequestedE={this.itemFocusRequestedBus}
            />
        const syntaxDisplay =
            <SyntaxDisplay
                syntaxItems={this.state.syntaxItems}
                backgroundColor={this.state.backgroundColor}
                onRequestItemFocus={p => this.itemFocusRequestedBus.push(p)}
            />

        return (
            <div className="App">
                <div className="App-header">
                    <div>
                        <FileSelector onChoose={this.onFileChoose} />
                        or
                        <input type="button" value="Load sample" onClick={this.onLoadSampleTheme} />
                    </div>
                    <div className="file-exporter">
                        <p>Export theme file</p>
                        <input type="button" value="Export" onClick={this.onExportClicked} />
                    </div>
                    <div>
                        <ControlPanel settings={this.state.settings} onSettingChange={this.onSettingChange} />
                    </div>
                </div>
                <div className="App-intro">
                    <div className="App-intro__controls">
                        {syntaxDisplay}
                        {themeEditor}
                    </div>
                </div>
            </div>
        );
    }
}

function saveString(data, filename, type) {
    const file = new Blob([data], { type })
    FileSaver.saveAs(file, filename)
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

function colorToPlistColor(color) {
    if (!color) return undefined
    const { r, g, b, a } = color
    return [r, g, b, a]
        .map(c => c.toPrecision(MAX_PLIST_DECIMAL_PRECISION))
        .map(c => `${c}`)
        .join(' ')
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

function fontToPlistFont(font) {
    if (!font) return undefined
    return `${font.name} - ${font.size}`
}

function syntaxItemsToPlistFontsAndColors(syntaxItems) {
    const colors = {}
    const fonts = {}

    for (const itemKey of Object.keys(syntaxItems)) {
        const { color, font } = syntaxItems[itemKey]
        colors[itemKey] = colorToPlistColor(color) || DEFAULT_PLIST_COLOR
        fonts[itemKey] = fontToPlistFont(font) || DEFAULT_PLIST_FONT
    }

    return { colors, fonts }
}

export default App