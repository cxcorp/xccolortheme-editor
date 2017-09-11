import React, { Component } from 'react'
import * as Bacon from 'baconjs'
import { decimalRgbToHex, hexToDecimalRgb } from '../util'
import './ThemeEditor.css'

/*
type Color = { r: number, g: number, b: number, a: number }
type Font = { name: string, size: number }
type Item = { readonly name: string, color: Color, font: Font }
type Props = {
    syntaxItems: [key: string]: { color: Color, font: Font } },
    onUpdate: (Item) => void,
    hideXcodePrefix: boolean,
    itemFocusRequestedE: Bacon.EventStream<string>
}
*/

export class ThemeEditor extends Component {
    constructor(props) {
        super(props)

        this.itemNameToRef = {}
        this.itemFocusRequestedUnsub = null

        this.onItemUpdate = this.onItemUpdate.bind(this)
        this.onRef = this.onRef.bind(this)
        this.requestItemFocus = this.requestItemFocus.bind(this)
    }

    requestItemFocus(itemName) {
        const ref = this.itemNameToRef[itemName]
        if (!ref) return
        ref.scrollIntoView()
        ref.focus()
    }

    onItemUpdate(newItem) {
        this.props.onUpdate(newItem)
    }

    onRef(ref) {
        const name = ref.dataset.name
        if (!name) return
        this.itemNameToRef[name] = ref
    }

    componentWillMount() {
        this.itemFocusRequestedUnsub = this.props.itemFocusRequestedE.onValue(this.requestItemFocus)
    }

    componentWillUnmount() {
        this.itemFocusRequestedUnsub && this.itemFocusRequestedUnsub()
    }

    render() {
        const items = gatherItems(this.props.syntaxItems || [])
        const rows = items.map(i => {
            return (
                <ThemeItem
                    key={i.name}
                    item={i}
                    onUpdate={this.onItemUpdate}
                    inputRef={this.onRef}
                    hideXcodePrefix={this.props.hideXcodePrefix}
                />
            )
        })
        return (
            <div className="theme-editor">
                <table>
                    <thead>
                        <tr className="theme-editor__header-row">
                            <th className="theme-editor__header-element">Element</th>
                            <th>RGBA</th>
                            <th>Font</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        )
    }
}

const XCODE_NAME_PREFIX_REGEX = /^xcode\.syntax\./

/*type Color = { r: number, g: number, b: number, a: number }
type Font = { name: string, size: number }
type Item = { readonly name: string, color: Color, font: Font }
type Props = {
    item: Item,
    onUpdate: (Item) => void,
    inputRef: (HTMLELement??) => void,
    hideXcodePrefix: boolean
}
*/
class ThemeItem extends Component {
    constructor(props) {
        super(props)
        this.onColorUpdate = this.onColorUpdate.bind(this)
        this.onFontUpdate = this.onFontUpdate.bind(this)
    }

    onColorUpdate(newColor) {
        if (!newColor) return
        this.props.onUpdate({
            name: this.props.item.name,
            color: newColor,
            font: this.props.item.font
        })
    }

    onFontUpdate(newFont) {
        if (!newFont) return
        this.props.onUpdate({
            name: this.props.item.name,
            color: this.props.item.color,
            font: newFont
        })
    }

    render() {
        let { name } = this.props.item
        const { color, font } = this.props.item

        if (this.props.hideXcodePrefix && XCODE_NAME_PREFIX_REGEX.test(name)) {
            name = name.replace(XCODE_NAME_PREFIX_REGEX, '')
        }

        return (
            <tr className="theme-item" tabIndex={-1} data-name={name} ref={this.props.inputRef}>
                <td className="theme-item__name"><code>{name}</code></td>
                <ThemeItemColor color={color} onUpdate={this.onColorUpdate} />
                <ThemeItemFont font={font} onUpdate={this.onFontUpdate} />
            </tr>
        )
    }
}

// type Props = { color: Color, onUpdate: (Color) => void }
class ThemeItemColor extends Component {
    constructor(props) {
        super(props)
        this.onColorUpdate = this.onColorUpdate.bind(this)
        this.onAlphaUpdate = this.onAlphaUpdate.bind(this)
    }

    onColorUpdate(e) {
        const value = e.target.value
        const color = hexToDecimalRgb(value.replace('#', ''))
        if (!color) return
        color.a = this.props.color.a
        this.props.onUpdate(color)
    }

    onAlphaUpdate(e) {
        const value = e.target.value
        let alpha = parseFloat(value.replace(',', '.'))
        if (isNaN(alpha)) return

        const color = { ...this.props.color, a: alpha }
        this.props.onUpdate(color)
    }

    render() {
        const { r, g, b, a } = this.props.color
        const hex = `#${decimalRgbToHex(r, g, b)}`

        return (
            <td className="theme-item__color">
                <input
                    className="theme-item__color-picker"
                    type="color"
                    value={hex}
                    onChange={this.onColorUpdate}
                />
                <input
                    className="theme-item__color-hex"
                    type="text"
                    value={hex}
                    onChange={this.onColorUpdate}
                />
                <input
                    className="theme-item__color-opacity"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={a}
                    onChange={this.onAlphaUpdate}
                />
            </td>
        )
    }
}

// type Props = { font: Font, onUpdate: (Font) => void }
class ThemeItemFont extends Component {
    constructor(props) {
        super(props)
        this.onNameUpdate = this.onNameUpdate.bind(this)
        this.onSizeUpdate = this.onSizeUpdate.bind(this)
    }

    onNameUpdate(e) {
        const value = e.target.value
        this.props.onUpdate({
            name: value,
            size: this.props.font.size
        })
    }

    onSizeUpdate(e) {
        const value = e.target.value
        const newSize = parseInt(value, 10)
        if (isNaN(newSize)) return
        this.props.onUpdate({
            name: this.props.font.name,
            size: newSize
        })
    }

    render() {
        const { name, size } = this.props.font
        return (
            <td className="theme-item__font">
                <input
                    type="text"
                    value={name}
                    className="theme-item__font-name"
                    onChange={this.onNameUpdate}
                />
                <input
                    type="number"
                    value={size}
                    step="1"
                    className="theme-item__font-size"
                    onChange={this.onSizeUpdate}
                />
            </td>
        )
    }
}

function gatherItems(syntaxItems) {
    const itemNames = Object.keys(syntaxItems)
    return itemNames.reduce(
        (items, name) => {
            // items: object[], name: string
            const newItem = { ...syntaxItems[name], name }
            items.push(newItem)
            return items
        },
        []
    )
}