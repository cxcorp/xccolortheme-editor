import React, { Component } from 'react'
import './ControlPanel.css'

// props: name, value, desc, onSettingChange: (name: string, value: any) => void
class BooleanSetting extends Component {
    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }

    onChange(e) {
        const newValue = !!e.target.checked
        this.props.onSettingChange(this.props.name, newValue)
    }

    render() {
        const { name, value, desc } = this.props
        return (
            <div className="boolean-setting">
                <label htmlFor={name}>{desc}</label>
                <input type="checkbox" id={name} checked={value} onChange={this.onChange} />
            </div>
        )
    }
}

const RENDERERS = {
    'boolean': BooleanSetting
}

/*
 * type Setting = {
 *     value: any,
 *     desc: string
 * }
 *
 * type Props = {
 *     settings: [name: string]: Setting,
 *     onSettingChange: (name: string, newValue: any) => void
 * } 
 */
export class ControlPanel extends Component {
    renderSettings() {
        const settings = []
        for (const settingName of Object.keys(this.props.settings)) {
            const setting = this.props.settings[settingName]
            const Renderer = RENDERERS[typeof setting.value]
            if (!Renderer)
                throw new Error(`No setting renderer exists for type ${typeof setting.value}! Setting ['${settingName}']: ${JSON.stringify(setting)}`)

            const item = (
                <li className="control-panel__setting" key={settingName}>
                    <Renderer
                        name={settingName}
                        value={setting.value}
                        desc={setting.desc}
                        onSettingChange={this.props.onSettingChange}
                    />
                </li>
            )
            settings.push(item)
        }
        return settings
    }

    render() {
        const settings = this.renderSettings()

        return (
            <div className="control-panel">
                <ul className="control-panel__list">
                    {settings}
                </ul>
            </div>
        );
    }
}